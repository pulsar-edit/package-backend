/**
 * @module postPackagesPackageNameVersions
 */

module.exports = {
  docs: {
    summary: "Creates a new package version.",
    responses: {
      201: {
        description: "An object with a key 'message' indicating what version has been published.",
      },
    },
  },
  endpoint: {
    method: "POST",
    paths: [
      "/api/packages/:packageName/versions",
      "/api/themes/:packageName/versions",
    ],
    rateLimit: "auth",
    successStatus: 201,
    options: {
      Allow: "POST",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    rename: (context, req) => {
      return context.query.rename(req);
    },
    auth: (context, req) => {
      return context.query.auth(req);
    },
    packageName: (context, req) => {
      return context.query.packageName(req);
    },
    tag: (context, req) => {
      return context.query.tag(req);
    }
  },
  async postReturnHTTP(req, res, context, obj) {
    // We use postReturnHTTP to ensure the user doesn't wait on these other actions

    // Lets bail early in case these values don't exist.
    // Such as the original request failing

    if (typeof obj?.webhook?.pack !== "string" || typeof obj?.webhook?.user !== "string") {
      // This data isn't defined, and we cannot work with it
      return;
    }

    if (
      typeof obj?.featureDetection?.user !== "string" ||
      typeof obj?.featureDetection?.ownerRepo !== "string" ||
      typeof obj?.featureDetection?.service !== "string"
    ) {
      // This data isn't defined, and we cannot work with it
      return;
    }

    await context.webhook.alertPublishVersion(
      obj.webhook.pack,
      obj.webhook.user
    );

    // Now to call for feature detection
    let features = await context.vcs.featureDetection(
      obj.featureDetection.user,
      obj.featureDetection.ownerRepo,
      obj.featureDetection.service
    );

    if (!features.ok) {
      context.logger.generic(3, features);
      return;
    }

    // THen we know we don't need to apply any special features for a standard
    // package, so we will check that early
    if (features.content.standard) {
      return;
    }

    let featureApply = await context.database.applyFeatures(
      features.content,
      obj.webhook.pack.name,
      obj.webhook.pack.version
    );

    if (!featureApply.ok) {
      logger.generic(3, featureApply);
      return;
    }

    // Otherwise we have completed successfully, while we could log, lets return
    return;
  },

  async logic(params, context) {
    const callStack = new context.callStack();
    // On renaming:
    // When a package is being renamed, we will expect that packageName will
    // match a previously published package.
    // But then the `name` of their `package.json` will be different.
    // And if they are, we expect that `rename` is true. Because otherwise it will fail.
    // That's the methodology, the logic here just needs to catch up.

    const user = await context.auth.verifyAuth(params.auth, context.database);

    callStack.addCall("auth.verifyAuth", user);

    if (!user.ok) {
      // TODO LOG
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("unauthorized")
        .addContent(user)
        .assignCalls(callStack)
        .addMessage(
          "User Authentication Failed when attempting to publish package version!"
        );
    }

    context.logger.generic(
      6,
      `${user.content.username} Attempting to publish a new package version - ${params.packageName}`
    );

    // To support a rename, we need to check if they have permissions over this
    // packages new name. Which means we have to check if they have ownership AFTER
    // we collect it's data.

    const packExists = await context.database.getPackageByName(
      params.packageName,
      true
    );

    callStack.addCall("db.getPackageByName", packExists);

    if (!packExists.ok) {
      // TODO LOG
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("not_found")
        .addContent(packExists)
        .assignCalls(callStack)
        .addMessage(
          "The server was unable to locate your package when publishing a new version."
        );
    }

    // Get `owner/repo` string format from package.
    let ownerRepo = context.utils.getOwnerRepoFromPackage(
      packExists.content.data
    );

    // Using our new VCS Service
    // TODO: The "git" service shouldn't always be hardcoded.
    let packMetadata = await context.vcs.newVersionData(
      user.content,
      ownerRepo,
      params.tag,
      "git"
    );

    callStack.addCall("vcs.newVersionData", packMetadata);

    if (!packMetadata.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(packMetadata)
        .addMessage(packMetadata.content) // Trust the output of VCS as an error message
        .assignCalls(callStack);
    }

    const newName = packMetadata.content.name;

    const currentName = packExists.content.name;
    if (newName !== currentName && !params.rename) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("bad_repo")
        .assignCalls(callStack)
        .addMessage(
          "Package name doesn't match local name, with rename false."
        );
    }

    // Else we will continue, and trust the name provided from the package as being accurate.
    // And now we can ensure the user actually owns this repo, with our updated name.

    // By passing `packMetadata` explicitely, it ensures that data we use to check
    // ownership is fresh, allowing for things like a package rename.

    const gitowner = await context.vcs.ownership(
      user.content,
      packMetadata.content
    );

    callStack.addCall("vcs.ownership", gitowner);

    if (!gitowner.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("unauthorized")
        .addContent(gitowner)
        .assignCalls(callStack)
        .addMessage("User failed git ownership check!");
    }

    // Now the only thing left to do, is add this new version with the name from the package.
    // And check again if the name is incorrect, since it'll need a new entry onto the names.

    const rename = newName !== currentName && params.rename;

    if (rename) {
      // Before allowing the rename of a package, ensure the new name isn't banned
      const isBanned = await context.utils.isPackageNameBanned(newName);

      if (isBanned.ok) {
        const sso = new context.sso();

        return sso
          .notOk()
          .addShort("server_error")
          .addContent(isBanned)
          .assignCalls(callStack)
          .addMessage("This package Name is Banned on the Pulsar Registry");
      }

      const isAvailable = await context.database.packageNameAvailability(
        newName
      );

      callStack.addCall("db.packageNameAvailability", isAvailable);

      if (isAvailable.ok) {
        const sso = new context.sso();

        return sso
          .notOk()
          .addShort("server_error")
          .addContent(isAvailable)
          .assignCalls(callStack)
          .addMessage(`The Package Name: ${newName} is not available.`);
      }
    }

    // Now add the new version key
    const addVer = await context.database.insertNewPackageVersion(
      packMetadata.content,
      rename ? currentName : null
    );

    callStack.addCall("db.insertNewPackageVersion", addVer);

    if (!addVer.ok) {
      // TODO Use hardcoded message until we can verify messages from db are safe
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("server_error")
        .addContent(addVer)
        .assignCalls(callStack)
        .addMessage("Failed to add the new package version to the database.");
    }

    const sso = new context.sso();

    // TODO the following reduces the good things an object builder gets us
    sso.webhook = {
      pack: packMetadata.content,
      user: user.content,
    };

    sso.featureDetection = {
      user: user.content,
      service: "git", // TODO stop hardcoding git
      ownerRepo: ownerRepo,
    };

    return sso.isOk().addContent(addVer).addMessage(addVer.content);
  },
};

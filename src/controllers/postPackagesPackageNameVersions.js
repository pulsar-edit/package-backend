/**
 * @module postPackagesPackageNameVersions
 */

module.exports = {
  docs: {
    summary: "Creates a new package version."
  },
  endpoint: {
    method: "POST",
    paths: [
      "/api/packages/:packageName/versions",
      "/api/themes/:packageName/versions"
    ],
    rateLimit: "auth",
    successStatus: 201,
    options: {
      Allow: "POST",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {
    rename: (context, req) => { return context.query.rename(req); },
    auth: (context, req) => { return context.query.auth(req); },
    packageName: (context, req) => { return context.query.packageName(req); }
  },
  async postReturnHTTP(req, res, context, obj) {
    // We use postReturnHTTP to ensure the user doesn't wait on these other actions
    await context.webhook.alertPublishVersion(obj.webhook.pack, obj.webhook.user);

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
    // On renaming:
    // When a package is being renamed, we will expect that packageName will
    // match a previously published package.
    // But then the `name` of their `package.json` will be different.
    // And if they are, we expect that `rename` is true. Because otherwise it will fail.
    // That's the methodology, the logic here just needs to catch up.

    const user = await context.auth.verifyAuth(params.auth, context.database);

    if (!user.ok) {
      // TODO LOG
      const sso = new context.sso();

      return sso.notOk().addShort("unauthorized")
                        .addContent(user)
                        .addCalls("auth.verifyAuth", user)
                        .addMessage("User Authentication Failed when attempting to publish package version!");
    }

    context.logger.generic(
      6,
      `${user.content.username} Attempting to publish a new package version - ${params.packageName}`
    );

    // To support a rename, we need to check if they have permissions over this
    // packages new name. Which means we have to check if they have ownership AFTER
    // we collect it's data.

    const packExists = await context.database.getPackageByName(params.packageName, true);

    if (!packExists.ok) {
      // TODO LOG
      const sso = new context.sso();

      return sso.notOk().addShort("not_found")
                        .addContent(packExists)
                        .addCalls("auth.verifyAuth", user)
                        .addCalls("db.getPackageByName", packExists)
                        .addMessage("The server was unable to locate your package when publishing a new version.");
    }

    // Get `owner/repo` string format from package.
    let ownerRepo = context.utils.getOwnerRepoFromPackage(packExists.content.data);

    // Using our new VCS Service
    // TODO: The "git" service shouldn't always be hardcoded.
    let packMetadata = await context.vcs.newVersionData(user.content, ownerRepo, "git");

    if (!packMetadata.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(packMetadata)
                        .addCalls("auth.verifyAuth", user)
                        .addCalls("db.getPackageByName", packExists)
                        .addCalls("vcs.newVersionData", packMetadata);
    }

    const newName = packMetadata.content.name;

    const currentName = packExists.content.name;
    if (newName !== currentName && !params.rename) {
      const sso = new context.sso();

      return sso.notOk().addShort("bad_repo")
                        .addCalls("auth.verifyAuth", user)
                        .addCalls("db.getPackageByName", packExists)
                        .addCalls("vcs.newVersionData", packMetadata)
                        .addMessage("Package name doesn't match local name, with rename false.");
    }

    // Else we will continue, and trust the name provided from the package as being accurate.
    // And now we can ensure the user actually owns this repo, with our updated name.

    // By passing `packMetadata` explicitely, it ensures that data we use to check
    // ownership is fresh, allowing for things like a package rename.

    const gitowner = await context.vcs.ownership(user.content, packMetadata.content);

    if (!gitowner.ok) {
      const sso = new context.sso();

      return sso.notOk().addShort("unauthorized")
                        .addContent(gitowner)
                        .addCalls("auth.verifyAuth", user)
                        .addCalls("db.getPackageByName", packExists)
                        .addCalls("vcs.newVersionData", packMetadata)
                        .addCalls("vcs.ownership", gitowner)
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

        return sso.notOk().addShort("server_error")
                          .addContent(isBanned)
                          .addCalls("auth.verifyAuth", user)
                          .addCalls("db.getPackageByName", packExists)
                          .addCalls("vcs.newVersionData", packMetadata)
                          .addCalls("vcs.ownership", gitowner)
                          .addMessage("This package Name is Banned on the Pulsar Registry");
      }

      const isAvailable = await context.database.packageNameAvailability(newName);

      if (isAvailable.ok) {
        const sso = new context.sso();

        return sso.notOk().addShort("server_error")
                          .addContent(isAvailable)
                          .addCalls("auth.verifyAuth", user)
                          .addCalls("db.getPackageByName", packExists)
                          .addCalls("vcs.newVersionData", packMetadata)
                          .addCalls("vcs.ownership", gitowner)
                          .addCalls("db.packageNameAvailability", isAvailable)
                          .addMessage(`The Package Name: ${newName} is not available.`);
      }
    }

    // Now add the new version key
    const addVer = await context.database.insertNewPackageVersion(
      packMetadata.content,
      rename ? currentName : null
    );

    if (!addVer.ok) {
      // TODO Use hardcoded message until we can verify messages from db are safe
      const sso = new context.sso();

      return sso.notOk().addShort("server_error")
                        .addContent(addVer)
                        .addCalls("auth.verifyAuth", user)
                        .addCalls("db.getPackageByName", packExists)
                        .addCalls("vcs.newVersionData", packMetadata)
                        .addCalls("vcs.ownership", gitowner)
                        .addCalls("db.packageNameAvailability", isAvailable)
                        .addCalls("db.insertNewPackageVersion", addVer)
                        .addMessage("Failed to add the new package version to the database.");
    }

    const sso = new context.sso();

    // TODO the following reduces the good things an object builder gets us
    sso.webhook = {
      pack: packMetadata.content,
      user: user.content
    };

    sso.featureDetection = {
      user: user.content,
      service: "git", // TODO stop hardcoding git
      ownerRepo: ownerRepo
    };

    return sso.isOk().addContent(addVer.content);
  }
};

/**
 * @module postPackages
 */
const parseGithubURL = require("parse-github-url");

module.exports = {
  docs: {
    summary: "Publishes a new Package.",
    responses: {
      201: {
        description: "The package's details indicating success.",
        content: {
          "application/json": "$packageObjectFull",
        },
      },
    },
  },
  endpoint: {
    method: "POST",
    paths: ["/api/packages", "/api/themes"],
    rateLimit: "auth",
    successStatus: 201,
    options: {
      Allow: "POST, GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    repository: (context, req) => {
      return context.query.repository(req);
    },
    auth: (context, req) => {
      return context.query.auth(req);
    },
  },
  async postReturnHTTP(req, res, context, obj) {
    // Return to user before wbehook call, so user doesn't wait on it

    if (!obj.webhook || !obj.featureDetection) {
      // Seems the `logic` function didn't execute successfully. Lets exit
      return;
    }

    await context.webhook.alertPublishPackage(
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
      // TODO: LOG
      return;
    }

    // Then we know we don't need to apply any special features for a standard
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
      // TODO LOG
      return;
    }

    // Now everything has completed successfully
    return;
  },

  async logic(params, context) {
    const callStack = new context.callStack();

    const user = await context.auth.verifyAuth(params.auth, context.database);

    callStack.addCall("auth.verifyAuth", user);

    // Check authentication
    if (!user.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(user).assignCalls(callStack);
    }

    // Check repository format validity.
    if (params.repository === "" || typeof params.repository !== "string") {
      // repository format is invalid
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("bad_repo")
        .addMessage("Repository is missing.");
    }

    // Currently though the repository is in `owner/repo` format,
    // meanwhile needed functions expects just `repo`

    const repo = parseGithubURL(params.repository)?.name.toLowerCase();
    const ownerRepo = parseGithubURL(params.repository)?.repo;

    if (repo === undefined) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("bad_repo")
        .addMessage("Repository format is invalid.");
    }

    // Now check if the name is banned.
    const isBanned = await context.utils.isPackageNameBanned(repo);

    if (isBanned.ok) {
      // The package name is banned
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("server_error")
        .addMessage("This package name is banned.");
    }

    // Now we know the package doesn't exist. And we want to check that the user
    // has permissions to this package
    const gitowner = await context.vcs.ownership(
      user.content,
      ownerRepo
    );

    callStack.addCall("vcs.ownership", gitowner);

    if (!gitowner.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(gitowner).assignCalls(callStack);
    }

    // Now knowing they own the git repo, and it doesn't exist here, lets publish.
    // TODO: Stop hardcoding `git` as service
    const newPack = await context.vcs.newPackageData(
      user.content,
      ownerRepo,
      "git"
    );

    callStack.addCall("vcs.newPackageData", newPack);

    if (!newPack.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(newPack)
        .addMessage(newPack.content) // This is where we trust the output
        .assignCalls(callStack);
    }

    // Now that we have the name the package will actually take, we want
    // to make sure this doesn't exist
    const nameAvailable = await context.database.packageNameAvailability(
      newPack.content.name
    );

    callStack.addCall("db.packageNameAvailability", nameAvailable);

    if (!nameAvailable.ok) {
      // We need to ensure the error is not found or otherwise
      if (nameAvailable.short !== "not_found") {
        // the server failed for some other bubbled reason
        const sso = new context.sso();

        return sso.notOk().addContent(nameAvailable).assignCalls(callStack);
      }
      // But if the short is in fact "not_found" we can report the package as
      // not being available at this name
      const sso = new context.sso();

      return sso.notOk().addShort("package_exists").assignCalls(callStack);
    }

    // Now to check if this package is a bundled package (since they don't exist on the db)
    const isBundled = context.bundled.isNameBundled(newPack.content.name);

    callStack.addCall("bundled.isNameBundled", isBundled);

    if (isBundled.ok && isBundled.content) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("package_exists")
        .assignCalls(callStack);
    }

    // Now with valid package data, we can insert them into the DB
    const insertedNewPack = await context.database.insertNewPackage(
      newPack.content
    );

    callStack.addCall("db.insertNewPackage", insertedNewPack);

    if (!insertedNewPack.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(insertedNewPack).assignCalls(callStack);
    }

    // Finally we can return what was actually put into the databse.
    // Retrieve the data from database.getPackageByName() and
    // convert it inot a package object full format
    const newDbPack = await context.database.getPackageByName(
      newPack.content.name,
      true
    );

    callStack.addCall("db.getPackageByName", newDbPack);

    if (!newDbPack.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(newDbPack).assignCalls(callStack);
    }

    const packageObjectFull = await context.models.constructPackageObjectFull(
      newDbPack.content
    );

    // Since this is a webhook call, we will return with some extra data
    // Although this kinda defeats the point of the object builder
    const sso = new context.sso();

    sso.webhook = {
      pack: packageObjectFull,
      user: user.content,
    };

    sso.featureDetection = {
      user: user.content,
      service: "git", // TODO stop hardcoding git
      ownerRepo: ownerRepo,
    };

    return sso.isOk().addContent(packageObjectFull);
  },
};

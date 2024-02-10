/**
 * @module deletePackagesPackageNameVersionsVersionName
 */

module.exports = {
  docs: {
    summary:
      "Deletes a package version. Once a version is deleted, it cannot be used again.",
    responses: {
      204: {
        description: "An empty response, indicating success.",
      },
    },
  },
  endpoint: {
    method: "DELETE",
    paths: [
      "/api/packages/:packageName/versions/:versionName",
      "/api/themes/:packageName/versions/:versionName",
    ],
    rateLimit: "auth",
    successStatus: 204,
    options: {
      Allow: "GET, DELETE",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    auth: (context, req) => {
      return context.query.auth(req);
    },
    packageName: (context, req) => {
      return context.query.packageName(req);
    },
    versionName: (context, req) => {
      return context.query.engine(req.params.versionName);
    },
  },

  async logic(params, context) {
    // Moving this forward to do the least computationally expensive task first.
    // Check version validity
    if (params.versionName === false) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("not_found")
        .addMessage("The version provided is invalid.");
    }

    // Verify the user has local and remote permissions
    const user = await context.auth.verifyAuth(params.auth, context.database);

    if (!user.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(user).addCalls("auth.verifyAuth", user);
    }

    // Lets also first check to make sure the package exists
    const packageExists = await context.database.getPackageByName(
      params.packageName,
      true
    );

    if (!packageExists.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(packageExists)
        .addCalls("auth.verifyAuth", user)
        .addCalls("db.getPackageByName", packageExists);
    }

    const gitowner = await context.vcs.ownership(
      user.content,
      packageExists.content
    );

    if (!gitowner.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(gitowner)
        .addCalls("auth.verifyAuth", user)
        .addCalls("db.getPackageByName", packageExists)
        .addCalls("vcs.ownership", gitowner);
    }

    // Mark the specified version for deletion, if version is valid
    const removeVersion = await context.database.removePackageVersion(
      params.packageName,
      params.versionName
    );

    if (!removeVersion.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(removeVersion)
        .addCalls("auth.verifyAuth", user)
        .addCalls("db.getPackageByName", packageExists)
        .addCalls("vcs.ownership", gitowner)
        .addCalls("db.removePackageVersion", removeVersion);
    }

    const sso = new context.sso();

    return sso.isOk().addContent(false);
  },
};

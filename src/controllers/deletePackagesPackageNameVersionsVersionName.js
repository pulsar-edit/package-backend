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
    const callStack = new context.callStack();
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

    callStack.addCall("auth.verifyAuth", user);

    if (!user.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(user).assignCalls(callStack);
    }

    // Lets also first check to make sure the package exists
    const packageExists = await context.database.getPackageByName(
      params.packageName,
      true
    );

    callStack.addCall("db.getPackageByName", packageExists);

    if (!packageExists.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(packageExists).assignCalls(callStack);
    }

    const gitowner = await context.vcs.ownership(
      user.content,
      packageExists.content
    );

    callStack.addCall("vcs.ownership", gitowner);

    if (!gitowner.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(gitowner).assignCalls(callStack);
    }

    // Mark the specified version for deletion, if version is valid
    const removeVersion = await context.database.removePackageVersion(
      params.packageName,
      params.versionName
    );

    callStack.addCall("db.rremovePackageVersion", removeVersion);

    if (!removeVersion.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(removeVersion).assignCalls(callStack);
    }

    const sso = new context.sso();

    return sso.isOk().addContent(false);
  },
};

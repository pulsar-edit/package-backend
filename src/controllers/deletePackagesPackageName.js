/**
 * @module deletePackagesPackageName
 */

module.exports = {
  docs: {
    summary: "Delete a package.",
    responses: {
      204: {
        description: "An empty response, indicating success.",
      },
    },
  },
  endpoint: {
    method: "DELETE",
    paths: ["/api/packages/:packageName", "/api/themes/:packageName"],
    rateLimit: "auth",
    successStatus: 204,
    options: {
      Allow: "DELETE, GET",
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
  },

  async logic(params, context) {
    const callStack = new context.callStack();

    const user = await context.auth.verifyAuth(params.auth, context.database);

    callStack.addCall("auth.verifyAuth", user);

    if (!user.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(user)
        .addMessage("Please update your token if you haven't done so recently.")
        .assignCalls(callStack);
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

    // Get `owner/repo` string format from pacakge
    const ownerRepo = context.utils.getOwnerRepoFromPackage(
      packageExists.content.data
    );

    const gitowner = await context.vcs.ownership(user.content, ownerRepo);

    callStack.addCall("vcs.ownership", gitowner);

    if (!gitowner.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(gitowner).assignCalls(callStack);
    }

    // Now they are logged in locally, and have permissions over the GitHub repo
    const rm = await context.database.removePackageByName(params.packageName);

    callStack.addCall("db.removePackageByName", rm);

    if (!rm.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(rm).assignCalls(callStack);
    }

    const sso = new context.sso();

    return sso.isOk().addContent(false);
  },
};

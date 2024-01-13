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
    const user = await context.auth.verifyAuth(params.auth, context.database);

    if (!user.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(user)
        .addMessage("Please update your token if you haven't done so recently.")
        .addCalls("auth.verifyAuth", user);
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

    // Get `owner/repo` string format from pacakge
    const ownerRepo = context.utils.getOwnerRepoFromPackage(
      packageExists.content.data
    );

    const gitowner = await context.vcs.ownership(user.content, ownerRepo);

    if (!gitowner.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(gitowner)
        .addCalls("auth.verifyAuth", user)
        .addCalls("db.getPackageByName", packageExists)
        .addCalls("vcs.ownership", gitowner);
    }

    // Now they are logged in locally, and have permissions over the GitHub repo
    const rm = await context.database.removePackageByName(params.packageName);

    if (!rm.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(rm)
        .addCalls("auth.verifyAuth", user)
        .addCalls("db.getPackageByName", packageExists)
        .addCalls("vcs.ownership", gitowner)
        .addCalls("db.removePackageByName", rm);
    }

    const sso = new context.sso();

    return sso.isOk().addContent(false);
  },
};

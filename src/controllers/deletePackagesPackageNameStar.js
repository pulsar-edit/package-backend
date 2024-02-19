/**
 * @module DeletePackagesPackageNameStar
 */

module.exports = {
  docs: {
    summary: "Unstar a package.",
    responses: {
      204: {
        description: "An empty response, indicating success.",
      },
    },
  },
  endpoint: {
    method: "DELETE",
    paths: ["/api/packages/:packageName/star", "/api/themes/:packageName/star"],
    rateLimit: "auth",
    successStatus: 204,
    options: {
      Allow: "DELETE, POST",
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

      return sso.notOk().addContent(user).assignCalls(callStack);
    }

    const unstar = await context.database.updateDecrementStar(
      user.content,
      params.packageName
    );

    callStack.addCall("db.updateDecrementStar", unstar);

    if (!unstar.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(unstar).assignCalls(callStack);
    }

    const sso = new context.sso();

    return sso.isOk().addContent(false);
  },
};

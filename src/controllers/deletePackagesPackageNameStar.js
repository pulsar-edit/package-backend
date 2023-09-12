module.exports = {
  docs: {

  },
  endpoint: {
    method: "DELETE",
    paths: [
      "/api/packages/:packageName/star",
      "/api/themes/:packageName/star"
    ],
    rateLimit: "auth",
    successStatus: 201,
    options: {
      Allow: "DELETE, POST",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {
    auth: (context, req) => { return context.query.auth(req); },
    packageName: (context, req) => { return context.query.packageName(req); }
  },
  async logic(params, context) {
    const user = await context.auth.verifyAuth(params.auth, context.database);

    if (!user.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(user)
                        .addCalls("auth.verifyAuth", user);
    }

    const unstar = await context.database.updateDecrementStar(user.content, params.packageName);

    if (!unstar.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(unstar)
                        .addCalls("auth.verifyAuth", user)
                        .addCalls("db.updateDecrementStar", unstar);
    }

    const sso = new context.sso();

    return sso.isOk().addContent(false);
  }
};

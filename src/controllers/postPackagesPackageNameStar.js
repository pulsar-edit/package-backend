/**
 * @module postPackagesPackageNameStar
 */

module.exports = {
  docs: {
    summary: "Star a package.",
    responses: {
      200: {
        description: "A 'Package Object Full' of the modified package",
        content: {
          "application/json": "$packageObjectFull",
        },
      },
    },
  },
  endpoint: {
    method: "POST",
    paths: ["/api/packages/:packageName/star", "/api/themes/:packageName/star"],
    rateLimit: "auth",
    successStatus: 200,
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
    const user = await context.auth.verifyAuth(params.auth, context.database);

    if (!user.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(user).addCalls("auth.verifyAuth", user);
    }

    const star = await context.database.updateIncrementStar(
      user.content,
      params.packageName
    );

    if (!star.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(star)
        .addCalls("auth.verifyAuth", user)
        .addCalls("db.updateIncrementStar", star);
    }

    // Now with a success we want to return the package back in this query
    let pack = await context.database.getPackageByName(
      params.packageName,
      true
    );

    if (!pack.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(pack)
        .addCalls("auth.verifyAuth", user)
        .addCalls("db.updateIncrementStar", star)
        .addCalls("db.getPackageByName", pack);
    }

    pack = await context.utils.constructPackageObjectFull(pack.content);

    const sso = new context.sso();

    return sso.isOk().addContent(pack);
  },
};

module.exports = {
  docs: {
    summary: "List the authenticated users' starred packages.",
    responses: [
      {
        200: {
          description: "Return a value similar to `GET /api/packages`, an array of package objects.",
          content: {}
        }
      }
    ]
  },
  endpoint: {
    method: "GET",
    paths: [ "/api/stars" ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params(req, context) {
    return {
      auth: query.auth(req)
    };
  },

  /**
   * @async
   * @memberOf getStars
   * @function logic
   * @desc Returns an array of all packages the authenticated user has starred.
   */
  async logic(params, context) {
    let user = await context.auth.verifyAuth(params.auth, context.database);

    if (!user.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(user.content).addCalls("auth.verifyAuth", user);
    }

    let userStars = await context.database.getStarredPointersByUserID(user.content.id);

    if (!userStars.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(userStars.content)
                .addCalls("auth.verifyAuth", user)
                .addCalls("db.getStarredPointersByUserID", userStars);
    }

    if (userStars.content.length === 0) {
      // If we have a return with no items, means the user has no stars
      // And this will error out later when attempting to collect the data
      // for the stars. So we will return early
      const sso = new context.sso();

      return sso.isOk().addContent([]);
    }

    let packCol = await context.database.getPackageCollectionByID(userStars.content);

    if (!packCol.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(packCol.content)
                .addCalls("auth.verifyAuth", user)
                .addCalls("db.getStarredPointersByUserID", userStars)
                .addCalls("db.getPackageCollectionByID", packCol);
    }

    let newCol = await context.utils.constructPackageObjectShort(packCol.content);

    const sso = new context.sso();

    return sso.isOk().addContent(newCol);
  }
};

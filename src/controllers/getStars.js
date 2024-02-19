/**
 * @module getStars
 */

module.exports = {
  docs: {
    summary: "List the authenticated users' starred packages.",
    responses: {
      200: {
        description:
          "Return a value similar to `GET /api/packages`, an array of package objects.",
        content: {
          "application/json": "$packageObjectShortArray",
        },
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: ["/api/stars"],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    auth: (context, req) => {
      return context.query.auth(req);
    },
  },

  /**
   * @async
   * @memberOf getStars
   * @function logic
   * @desc Returns an array of all packages the authenticated user has starred.
   */
  async logic(params, context) {
    const callStack = new context.callStack();

    let user = await context.auth.verifyAuth(params.auth, context.database);

    callStack.addCall("auth.verifyAuth", user);

    if (!user.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(user)
        .addMessage("Please update your token if you haven't done so recently.")
        .assignCalls(callStack);
    }

    let userStars = await context.database.getStarredPointersByUserID(
      user.content.id
    );

    callStack.addCall("db.getStarredPointersByUserID", userStars);

    if (!userStars.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(userStars)
        .assignCalls(callStack);
    }

    if (userStars.content.length === 0) {
      // If we have a return with no items, means the user has no stars
      // And this will error out later when attempting to collect the data
      // for the stars. So we will return early
      const sso = new context.sso();

      return sso.isOk().addContent([]);
    }

    let packCol = await context.database.getPackageCollectionByID(
      userStars.content
    );

    callStack.addCall("db.getPackageCollectionByID", packCol);

    if (!packCol.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(packCol)
        .assignCalls(callStack);
    }

    let newCol = await context.models.constructPackageObjectShort(
      packCol.content
    );

    const sso = new context.sso();

    return sso.isOk().addContent(newCol);
  },
};

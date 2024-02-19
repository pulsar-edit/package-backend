/**
 * @module getPackagesPackageNameStargazers
 */

module.exports = {
  docs: {
    summary: "List the users that have starred a package.",
    responses: {
      200: {
        description: "A list of users.",
        content: {
          "application/json": "$userObjectPublicArray",
        },
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: [
      "/api/packages/:packageName/stargazers",
      "/api/themes/:packageName/stargazers",
    ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    packageName: (context, req) => {
      return context.query.packageName(req);
    },
  },

  /**
   * @async
   * @memberof getPackagesPackageNameStargazers
   * @function logic
   * @desc Returns an array of `star_gazers` from a specified package.
   * @param {object} params - The available query parameters.
   * @param {object} context - The Endpoint Context.
   * @returns {sso}
   */
  async logic(params, context) {
    const callStack = new context.callStack();

    // The following can't be executed in user mode because we need the pointer
    const pack = await context.database.getPackageByName(params.packageName);

    callStack.addCall("db.getPackageByName", pack);

    if (!pack.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(pack).assignCalls(callStack);
    }

    const stars = await context.database.getStarringUsersByPointer(
      pack.content
    );

    callStack.addCall("db.getStarringUsersByPointer", stars);

    if (!stars.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(stars).assignCalls(callStack);
    }

    const gazers = await context.database.getUserCollectionById(stars.content);

    callStack.addCall("db.getUserCollectionById", gazers);

    if (!gazers.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(gazers).assignCalls(callStack);
    }

    const sso = new context.sso();

    return sso.isOk().addContent(gazers.content);
  },
};

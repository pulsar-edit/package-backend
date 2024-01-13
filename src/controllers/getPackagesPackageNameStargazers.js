/**
 * @module getPackagesPackageNameStargazers
 */

module.exports = {
  docs: {
    summary: "List the users that have starred a package.",
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
    // The following can't be executed in user mode because we need the pointer
    const pack = await context.database.getPackageByName(params.packageName);

    if (!pack.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(pack).addCalls("db.getPackageByName", pack);
    }

    const stars = await context.database.getStarringUsersByPointer(
      pack.content
    );

    if (!stars.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(stars)
        .addCalls("db.getPackageByName", pack)
        .addCalls("db.getStarringUsersByPointer", stars);
    }

    const gazers = await context.database.getUserCollectionById(stars.content);

    if (!gazers.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(gazers)
        .addCalls("db.getPackageByName", pack)
        .addCalls("db.getStarringUsersByPointer", stars)
        .addCalls("db.getUserCollectionById", gazers);
    }

    const sso = new context.sso();

    return sso.isOk().addContent(gazers.content);
  },
};

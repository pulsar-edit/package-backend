/**
 * @module getThemes
 */

module.exports = {
  docs: {
    summary: "List all packages that are themes.",
    responses: {
      200: {
        description: "A paginated response of themes.",
        content: {
          "application/json": "$packageObjectShortArray",
        },
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: ["/api/themes"],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "POST, GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    page: (context, req) => {
      return context.query.page(req);
    },
    sort: (context, req) => {
      return context.query.sort(req);
    },
    direction: (context, req) => {
      return context.query.direction(req);
    },
  },

  /**
   * @async
   * @memberOf getThemes
   * @function logic
   * @desc Returns all themes to the user. Based on any filters they've applied
   * via query parameters.
   * @returns {object} ssoPaginate
   */
  async logic(params, context) {
    const packages = await context.database.getSortedPackages(params, true);

    if (!packages.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(packages)
        .addCalls("db.getSortedPackages", packages);
    }

    const packObjShort = await context.models.constructPackageObjectShort(
      packages.content
    );

    const packArray = Array.isArray(packObjShort)
      ? packObjShort
      : [packObjShort];

    const ssoP = new context.ssoPaginate();

    ssoP.resultCount = packages.pagination.count;
    ssoP.totalPages = packages.pagination.total;
    ssoP.limit = packages.pagination.limit;
    ssoP.buildLink(
      `${context.config.server_url}/api/themes`,
      packages.pagination.page,
      params
    );

    return ssoP.isOk().addContent(packArray);
  },
};

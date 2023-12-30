/**
 * @module getPackages
 */

module.exports = {
  docs: {
    summary: "List all packages"
  },
  endpoint: {
    method: "GET",
    paths: [ "/api/packages" ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "POST, GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {
    page: (context, req) => { return context.query.page(req); },
    sort: (context, req) => { return context.query.sort(req); },
    direction: (context, req) => { return context.query.dir(req); },
    serviceType: (context, req) => { return context.query.serviceType(req); },
    service: (context, req) => { return context.query.service(req); },
    serviceVersion: (context, req) => { return context.query.serviceVersion(req); },
    fileExtension: (context, req) => { return context.query.fileExtension(req); },
    owner: (context, req) => {
      return context.query.owner(req);
    }
  },

  /**
   * @async
   * @memberof getPackages
   * @function logic
   * @desc Returns all packages to user, filtered by query params.
   * @param {object} params - The available query parameters.
   * @param {object} context - The Endpoint Context.
   * @returns {ssoPaginate}
   */
  async logic(params, context) {
    const packages = await context.database.getSortedPackages(params);

    if (!packages.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(packages)
                        .addCalls("db.getSortedPackages", packages);
    }

    const packObjShort = await context.utils.constructPackageObjectShort(packages.content);

    const packArray = Array.isArray(packObjShort) ? packObjShort : [ packObjShort ];

    const ssoP = new context.ssoPaginate();

    ssoP.resultCount = packages.pagination.count;
    ssoP.totalPages = packages.pagination.total;
    ssoP.limit = packages.pagination.limit;
    ssoP.buildLink(`${context.config.server_url}/api/packages`, packages.pagination.page, params);

    return ssoP.isOk().addContent(packArray);
  }
};

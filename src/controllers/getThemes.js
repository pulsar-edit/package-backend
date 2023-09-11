
module.exports = {
  endpoint: {
    method: "GET",
    paths: [ "/api/themes" ],
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
    direction: (context, req) => { return context.query.dir(req); }
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

      return sso.notOk().addContent(packages.content).addCalls("db.getSortedPackages", packages);
    }

    const packObjShort = await context.utils.constructPackageObjectShort(
      packages.content
    );

    const packArray = Array.isArray(packObjShort) ? packObjShort : [ packObjShort ];

    const ssoP = new context.ssoPaginate();

    ssoP.total = packages.pagination.total;
    ssoP.limit = packages.pagination.total;
    ssoP.buildLink(`${context.config.server_url}/api/themes`, page, params);

    return ssoP.isOk().addContent(packArray);
  }
};

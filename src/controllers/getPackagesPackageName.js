/**
 * @module getPackagesPackageName
 */

module.exports = {
  docs: {
    summary: "Show package details.",
    responses: {
      200: {
        description: "A 'Package Object Full' of the requested package.",
        content: {
          "application/json": "$packageObjectFull",
        },
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: ["/api/packages/:packageName", "/api/themes/:packageName"],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "DELETE, GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    engine: (context, req) => {
      return context.query.engine(req.query.engine);
    },
    packageName: (context, req) => {
      return context.query.packageName(req);
    },
  },

  /**
   * @async
   * @memberof getPackagesPackageName
   * @function logic
   * @desc Returns the data of a single requested package, as a Package Object Full.
   * @param {object} params - The available query parameters.
   * @param {object} context - The Endpoint Context.
   * @returns {sso}
   */
  async logic(params, context) {
    let pack = await context.database.getPackageByName(
      params.packageName,
      true
    );

    if (!pack.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(pack).addCalls("db.getPackageByName", pack);
    }

    pack = await context.utils.constructPackageObjectFull(pack.content);

    if (params.engine !== false) {
      // query.engine returns false if no valid query param is found.
      // before using engineFilter we need to check the truthiness of it.

      pack = await context.utils.engineFilter(pack, params.engine);
    }

    const sso = new context.sso();

    return sso.isOk().addContent(pack);
  },
};

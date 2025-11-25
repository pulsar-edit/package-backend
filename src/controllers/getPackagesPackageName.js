/**
 * @module getPackagesPackageName
 */

module.exports = {
  version: 2,
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
  async logic(ctx) {
    const { params } = ctx;

    // Lets first check if this is a bundled package we should return
    ctx.timecop.start("bundle");
    const isBundled = ctx.bundled.isNameBundled(params.packageName);
    ctx.timecop.end("bundle");
    if (isBundled.ok && isBundled.content) {
      // This is in fact a bundled package
      const bundledData = ctx.bundled.getBundledPackage(params.packageName);

      if (!bundledData.ok) {
        const sso = new ctx.sso();

        return sso
          .notOk()
          .addContent(bundledData)
          .addCalls("bundled.isBundled", isBundled);
      }

      const sso = new ctx.sso();

      return sso.isOk().addContent(bundledData.content);
    }

    ctx.timecop.start("db");

    let pack = await ctx.database.getPackageByName(
      params.packageName,
      true
    );

    ctx.timecop.end("db");
    if (!pack.ok) {
      const sso = new ctx.sso();

      return sso.notOk().addContent(pack).addCalls("db.getPackageByName", pack);
    }

    ctx.timecop.start("construct");
    pack = await ctx.models.constructPackageObjectFull(pack.content);

    if (params.engine !== false) {
      // query.engine returns false if no valid query param is found.
      // before using engineFilter we need to check the truthiness of it.

      pack = await ctx.utils.engineFilter(pack, params.engine);
    }
    ctx.timecop.end("construct");

    const sso = new ctx.sso();

    return sso.isOk().addContent(pack);
  },
};

/**
 * @module getPackagesPackageNameVersionsVersionName
 */

module.exports = {
  docs: {
    summary: "Get the details of a specific package version.",
    responses: {
      200: {
        description: "The 'package.json' plus more details of a single package version.",
        content: {
          "application/json": "$packageObjectJSON",
        },
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: [
      "/api/packages/:packageName/versions/:versionName",
      "/api/themes/:packageName/versions/:versionName",
    ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET, DELETE",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    packageName: (context, req) => {
      return context.query.packageName(req);
    },
    versionName: (context, req) => {
      return context.query.engine(req.params.versionName);
    },
  },

  /**
   * @async
   * @memberof getPackagesPackageNameVersionsVersionName
   * @function logic
   * @desc Used to retrieve the details of a specific version of a package.
   * @param {object} params - The available query parameters.
   * @param {object} context - The Endpoint Context.
   * @returns {sso}
   */
  async logic(params, context) {
    // Check the truthiness of the returned query engine
    if (params.versionName === false) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("not_found")
        .addMessage("The version provided is invalid.");
    }

    // Now we know the version is a valid semver.

    const pack = await context.database.getPackageVersionByNameAndVersion(
      params.packageName,
      params.versionName
    );

    if (!pack.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(pack)
        .addCalls("db.getPackageVersionByNameAndVersion", pack);
    }

    const packRes = await context.models.constructPackageObjectJSON(
      pack.content
    );

    const sso = new context.sso();

    return sso.isOk().addContent(packRes);
  },
};

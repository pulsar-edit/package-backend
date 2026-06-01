/**
 * @module getPackagesPackageNameAvailability
*/

module.exports = {
  docs: {
    summary: "Check if a package name is available.",
    responses: {
      204: {
        description: "An empty response, indicating the package name is available for use."
      },
      409: {
        description: "Indicates that the requested package name is taken, and is NOT available.",
        content: {
          "application/json": {
            schema: {
              type: "object"
            }
          }
        }
      }
    }
  },
  endpoint: {
    method: "GET",
    paths: ["/api/packages/:packageName/availability", "/api/themes/:packageName/availability"],
    rateLimit: "generic",
    successStatus: 204,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {
    packageName: (context, req) => {
      return context.query.packageName(req);
    }
  },

  /**
   * @async
   * @memberOf getPackagesPackageNameAvailability
   * @function logic
   * @desc Informs the requester of the availability of a package name on the database.
   * @param {object} params - The available query parameters.
   * @param {object} context - The Endpoint Context
   * @returns {sso}
  */
  async logic(params, context) {
    const callStack = new context.callStack();

    // Is the name banned?
    const isBanned = await context.utils.isPackageNameBanned(params.packageName);

    callStack.addCall("utils.isPackageNameBanned", isBanned);

    if (isBanned.ok) {
      // The package name is in fact banned
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("package_exists")
        .assignCalls(callStack);
    }

    // Is the name of a bundled package?
    const isBundled = context.bundled.isNameBundled(params.packageName);

    callStack.addCall("bundled.isNameBundled", isBundled);

    if (isBundled.ok && isBundled.content) {
      // This is in fact a bundled package
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("package_exists")
        .assignCalls(callStack);
    }

    // Is the name taken by another package?
    const nameAvailable = await context.database.packageNameAvailability(params.packageName);

    callStack.addCall("db.packageNameAvailability", nameAvailable);

    if (!nameAvailable.ok) {
      // We need to ensure the error is not found or otherwise
      if (nameAvailable.short !== "not_found") {
        // the server failed for some other reason
        const sso = new context.sso();

        return sso.notOk().addContent(nameAvailable).assignCalls(callStack);
      }
      // But if the short is "not_found" we can report the package as not being available
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("package_exists")
        .assignCalls(callStack);
    }

    // Otherwise the package name is available
    const sso = new context.sso();

    return sso.isOk().addContent(false);
  }
};

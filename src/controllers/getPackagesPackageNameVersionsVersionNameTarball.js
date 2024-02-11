/**
 * @module getPackagesPackageNameVersionsVersionNameTarball
 */

const { URL } = require("node:url");

module.exports = {
  docs: {
    summary:
      "Previously undocumented endpoint. Allows for installation of a package.",
    responses: {
      302: {
        description: "Redirect to the GitHub tarball URL.",
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: [
      "/api/packages/:packageName/versions/:versionName/tarball",
      "/api/themes/:packageName/versions/:versionName/tarball",
    ],
    rateLimit: "generic",
    successStatus: 302,
    options: {
      Allow: "GET",
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
   * @memberof getPackagesPackageNameVersionsVersionNameTarball
   * @function logic
   * @desc Get the tarball of a specific package version.
   * @param {object} params - The available query parameters.
   * @param {object} context - The Endpoint Context.
   * @returns {sso}
   */
  async logic(params, context) {
    const callStack = new context.callStack();

    // First ensure our version is valid
    if (params.versionName === false) {
      // since query.engine gives false if invalid, we can check the truthiness
      // but returning early uses less compute, as a false version will never be found
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("not_found")
        .addMessage("The version provided is invalid.");
    }

    const pack = await context.database.getPackageVersionByNameAndVersion(
      params.packageName,
      params.versionName
    );

    callStack.addCall("db.getPackageVersionByNameAndVersion", pack);

    if (!pack.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(pack)
        .assignCalls(callStack);
    }

    const save = await context.database.updatePackageIncrementDownloadByName(
      params.packageName
    );

    callStack.addCall("db.updatePackageIncrementDownloadByName", save);

    if (!save.ok) {
      context.logger.generic(3, "Failed to Update Downloads Count", {
        type: "object",
        obj: save.content,
      });
      // TODO We will probably want to revisit this after rewriting logging
      // We don't want to exit on failed update to download count, only log
    }

    // For simplicity, we will redirect the request to gh tarball url
    // Allowing downloads to take place via GitHub Servers
    // But before this is done, we will preform some checks to ensure the URL is correct/legit
    const tarballURL =
      pack.content.meta?.tarball_url ?? pack.content.meta?.dist?.tarball ?? "";
    let hostname = "";

    // Try to extract the hostname
    try {
      const tbUrl = new URL(tarballURL);
      hostname = tbUrl.hostname;
    } catch (err) {
      context.logger.generic(
        3,
        `Malformed tarball URL for version ${params.versionName} of ${params.packageName}`
      );

      callStack.addCall("URL.hostname", err);

      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(err)
        .addShort("server_error")
        .assignCalls(callStack)
        .addMessage(
          `The URL to download this package seems invalid: ${tarballURL}.`
        );
    }

    const allowedHostnames = [
      "codeload.github.com",
      "api.github.com",
      "github.com",
      "raw.githubusercontent.com",
    ];

    if (
      !allowedHostnames.includes(hostname) &&
      process.env.PULSAR_STATUS !== "dev"
    ) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addShort("server_error")
        .assignCalls(callStack)
        .addMessage(`Invalid Domain for Download Redirect: ${hostname}`);
    }

    const sso = new context.ssoRedirect();
    return sso.isOk().addContent(tarballURL);
  },
};

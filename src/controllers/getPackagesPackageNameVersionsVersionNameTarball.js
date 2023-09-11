const { URL } = require("node:url");

module.exports = {
  docs: {

  },
  endpoint: {
    method: "GET",
    paths: [
      "/api/packages/:packageName/versions/:versionName/tarball",
      "/api/themes/:packageName/versions/:versionName/tarball"
    ],
    rateLimit: "generic",
    successStatus: 302,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {
    packageName: (context, req) => { return context.query.packageName(req); },
    versionName: (context, req) => { return context.query.engine(req); }
  },
  async logic(params, context) {

    // First ensure our version is valid
    if (params.versionName === false) {
      // since query.engine gives false if invalid, we can check the truthiness
      // but returning early uses less compute, as a false version will never be found
      const sso = new context.sso();

      return sso.notOk().addShort("Not Found");
    }

    const pack = await context.database.getPackageVersionByNameAndVersion(
      params.packageName,
      params.versionName
    );

    if (!pack.ok) {
      const sso = new context.sso();

      return sso.noOk().addContent(pack.content)
                       .addCalls("db.getPackageVersionByNameAndVersion", pack);
    }

    const save = await context.database.updatePackageIncrementDownloadByName(params.packageName);

    if (!save.ok) {
      context.logger.generic(3, "Failed to Update Downloads Count", {
        type: "object",
        obj: save.content
      });
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
      const sso = new context.sso();

      return sso.notOk().addContent(err).addShort("Server Error");
    }

    const allowedHostnames = [
      "codeload.github.com",
      "api.github.com",
      "github.com",
      "raw.githubusercontent.com"
    ];

    if (
      !allowedHostnames.includes(hostname) &&
        process.env.PULSAR_STATUS !== "dev"
    ) {
      const sso = new context.sso();

      return sso.notOk().addContent(`Invalid Domain for Download Redirect: ${hostname}`).addShort("Server Error");
    }

    const sso = new context.sso();
    return sso.isOk().addContent(tarballURL);
  }
};

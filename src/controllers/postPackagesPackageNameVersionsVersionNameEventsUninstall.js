/**
 * @module postPackagesPackageNameVersionsVersionNameEventsUninstall
 */

module.exports = {
  docs: {
    summary: "Previously undocumented endpoint. Since v1.0.2 has no effect.",
    deprecated: true,
    responses: {
      201: {
        description:
          "A generic message indicating success, included only for backwards compatibility.",
        content: {},
      },
    },
  },
  endpoint: {
    method: "POST",
    paths: [
      "/api/packages/:packageName/versions/:versionName/events/uninstall",
      "/api/themes/:packageName/versions/:versionName/events/uninstall",
    ],
    rateLimit: "auth",
    successStatus: 201,
    options: {
      Allow: "POST",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {},
  async logic(params, context) {
    /**
      Used when a package is uninstalled, decreases the download count by 1.
      Originally an undocumented endpoint.
      The decision to return a '201' is based on how other POST endpoints return,
      during a successful event.
      This endpoint has now been deprecated, as it serves no useful features,
      and on further examination may have been intended as a way to collect
      data on users, which is not something we implement.
      * Deprecated since v1.0.2
      * see: https://github.com/atom/apm/blob/master/src/uninstall.coffee
      * While decoupling HTTP handling from logic, the function has been removed
        entirely: https://github.com/pulsar-edit/package-backend/pull/171
    */

    const sso = new context.sso();

    return sso.isOk().addContent({ ok: true });
  },
};

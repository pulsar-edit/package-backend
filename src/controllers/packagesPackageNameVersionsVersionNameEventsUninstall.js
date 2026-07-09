module.exports = {
  "/api/packages/:packageName/versions/:versionName/events/uninstall": {
    options: {
      summary: "Define permitted communication options for '/api/packages/:packageName/versions/:versionName/events/uninstall'.",
      responses: {
        204: {
          description: "The permitted communication options.",
          headers: {
            Allow: "$COMPUTE",
            "RateLimit-Policy": "$COMPUTE.default",
            "X-Content-TYpe-Options": "nosniff"
          }
        }
      },
      parameters: [],
      logic: {
        config: { preferResponse: 204 },
        middleware: ["$DEFAULT"],
        func: async (ctx, next) => { ctx.status = 204; }
      }
    },
    post: {
      summary: "Previously undocumented endpoint. Since v1.0.2 has no effect.",
      responses: {
        201: {
          description: "A generic message indicating success, included only for backwards compatibility.",
          headers: {
            Allow: "$COMPUTE",
            "$DEFAULT": "$COMPUTE",
            "X-Response-Time": "$COMPUTE",
            "Server-Timing": "$COMPUTE",
            "RateLimit-Policy": "$COMPUTE.default"
          }
        }
      },
      parameters: [],
      logic: {
        config: {
          preferResponse: 201,
        },
        middleware: ["$DEFAULT"],
        func: async (ctx, next) => {
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
          ctx.status = 201;
        }
      }
    }
  }
};

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
        func: async (ctx, next) => { ctx.status = 201; }
      }
    }
  }
};

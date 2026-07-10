module.exports = {
  "/api/updates": {
    options: {
      summary: "Define permitted communication options for '/api/updates'.",
      responses: {
        204: {
          description: "The permitted communication options.",
          headers: {
            Allow: "$COMPUTE",
            "RateLimit-Policy": "$COMPUTE.default",
            "X-Content-Type-Options": "nosniff"
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
    get: {
      summary: "List Pulsar Updates",
      description: "Currently returns 'Not Implemented' as Squirrel AutoUpdate is not supported.",
      responses: {
        200: {
          description: "Atom update feed, following the format expected by Squirrel.",
          content: {
            "application/json": "TODO"
          }
        },
        501: {
          description: "The server has not implemented the auto update features.",
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
          preferResponse: 501
        },
        middleware: ["$DEFAULT"],
        func: async (ctx, next) => { ctx.status = 501; }
      }
    }
  }
}

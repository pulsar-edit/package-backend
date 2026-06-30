module.exports = {
  "/api/users": {
    get: {
      summary: "Display details of the currently authenticated user.",
      description: "This endpoint only exists on the web version of the upstream API. Having no backend equivalent.",
      responses: {
        200: {
          description: "Details of the Authenticated User Account.",
          content: {
            "application/json": "TODO"
          },
          headers: {
            Allow: "$COMPUTE",
            "$DEFAULT": "$COMPUTE",
            "X-Response-Time": "$COMPUTE",
            "Server-Timing": "$COMPUTE",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Access-Control-Allow-Credentials",
            "Access-Control-Allow-Origin": "https://packages.pulsar-edit.dev",
            "Access-Control-Allow-Credentials": true,
          }
        }
      },
      parameters: [
        {
          name: "Authorization",
          in: "header",
          description: "Authorization Headers",
          required: true,
          allowEmptyValue: false,
          schema: {
            type: "string"
          }
        }
      ],
      logic: {
        config: {},
        middleware: [
          "$DEFAULT", "auth.verify"
        ],
        func: async (ctx, next) => {
          ctx.pulsar.timecop.start("logic");

          ctx.pulsar.timecop.stop("logic");
        }
      }
    }
  }
};

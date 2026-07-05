module.exports = {
  "/api/stars": {
    options: {
      summary: "Define permitted communication options for '/api/stars'.",
      responses: {
        204: {
          description: "The permitted communication options.",
          headers: {
            Allow: "$COMPUTE",
            "RateLimit-Policy": "$COMPUTE.auth",
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
      summary: "List the authenticated users' starred packages.",
      responses: {
        200: {
          description: "Return a value similar to `GET /api/packages`, an array of package objects.",
          content: {
            "application/json": "TODO"
          },
          headers: {
            Allow: "$COMPUTE",
            "$DEFAULT": "$COMPUTE",
            "X-Response-Time": "$COMPUTE",
            "Server-Timing": "$COMPUTE",
            "RateLimit-Policy": "$COMPUTE.auth"
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
        config: {
          allowExit: [ "auth.verify" ],
          preferResponse: 200
        },
        middleware: [
          "$DEFAULT", "auth.verify", "models.packageObjectShort"
        ],
        func: async (ctx, next) => {
          ctx.state.timecop.start("db.getStarredPointersByUserID");
          const userStars = await ctx.pulsar.db.getStarredPointersByUserID(
            ctx.state.funcs.auth.verify.content.id
          );

          if (!userStars.ok) {
            throw new ctx.pulsar.err.InternalApplicationError("Failed to get user stars.", { cause: userStars });
          };
          ctx.state.timecop.end("db.getStarredPointersByUserID");

          if (userStars.content.length === 0) {
            ctx.body = [];
            ctx.status = 200;
            return;
          }
          ctx.state.timecop.start("db.getPackageCollectionByID");

          const packCol = await ctx.pulsar.db.getPackageCollectionByID(userStars.content);

          if (!packCol.ok) {
            throw new ctx.pulsar.err.InternalApplicationError("Failed to get starred packages.", { cause: packCol });
          }
          ctx.state.timecop.end("db.getPackageCollectionByID");

          ctx.state.output = packCol.content;
          ctx.status = 200;
        }
      }
    }
  }
}

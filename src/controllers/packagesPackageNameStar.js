module.exports = {
  "/api/packages/:packageName/star": {
    options: {
      summary: "Define permitted communication options for '/api/packages/:packageName/star'.",
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
    post: {
      summary: "Star a package.",
      responses: {
        200: {
          description: "A 'Package Object Full' of the modified package.",
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
        },
        {
          name: "packageName",
          in: "path",
          description: "The name of the package to return details for. Must be URL escaped.",
          required: true,
          allowEmptyValue: false,
          example: "autocomplete-powershell",
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
          "$DEFAULT", "auth.verify", "models.packageObjectFull"
        ],
        func: async (ctx, next) => {
          ctx.state.timecop.start("db.updateIncrementStar");
          const star = await ctx.pulsar.db.updateIncrementStar(
            ctx.state.funcs.auth.verify.content,
            ctx.state.params.packageName
          );

          if (!star.ok) {
            // TODO Once we allow modules to throw errors directly we won't have to do this
            if (star.short === "not_found") {
              throw new ctx.pulsar.err.NotFound("Not Found", { cause: star });
            } else {
              throw new ctx.pulsar.err.InternalServerError("Failed to update stars", { cause: star });
            }
          }
          ctx.state.timecop.end("db.updateIncrementStar");
          ctx.state.timecop.start("db.getPackageByName");
          const pack = await ctx.pulsar.db.getPackageByName(
            ctx.state.params.packageName,
            true
          );

          if (!pack.ok) {
            throw new ctx.pulsar.err.InternalServerError("Failed to get package", { cause: pack });
          }
          ctx.state.timecop.end("db.getPackageByName");

          ctx.state.output = pack.content;
          ctx.status = 200;
        }
      }
    },
    delete: {
      summary: "Unstar a package.",
      responses: {
        204: {
          description: "Any empty response, indicating success.",
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
        },
        {
          name: "packageName",
          in: "path",
          description: "The name of the package to return details for. Must be URL escaped.",
          required: true,
          allowEmptyValue: false,
          example: "autocomplete-powershell",
          schema: {
            type: "string"
          }
        }
      ],
      logic: {
        config: {
          allowExit: [ "auth.verify" ],
          preferResponse: 204
        },
        middleware: [ "$DEFAULT", "auth.verify" ],
        func: async (ctx, next) => {
          ctx.state.timecop.start("logic");
          const unstar = await ctx.pulsar.db.updateDecrementStar(
            ctx.state.funcs.auth.verify.content,
            ctx.state.params.packageName
          );

          if (!unstar.ok) {
            throw new ctx.pulsar.err.InternalServerError("Failed to decrement package stars", { cause: unstar });
          }

          ctx.state.timecop.end("logic");

          ctx.status = 204;
        }
      }
    }
  }
};

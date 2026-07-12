module.exports = {
  "/api/packages/:packageName": {
    options: {
      summary: "Define permitted communication options for '/api/packages/:packageName'.",
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
      summary: "Show package details.",
      responses: {
        200: {
          description: "A 'Package Object Full' of the requested package.",
          content: {
            "application/json": "TODO"
          },
          headers: {
            Allow: "$COMPUTE",
            "$DEFAULT": "$COMPUTE",
            "RateLimit-Policy": "$COMPUTE.default",
            "X-Response-Time": "$COMPUTE",
            "Sever-Timing": "$COMPUTE"
          }
        }
      },
      parameters: [
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
        },
        {
          name: "engine",
          in: "query",
          description: "Only show packages compatible with this Pulsar version. Must be a valid Semver.",
          allowEmptyValue: true,
          example: "1.0.0",
          schema: {
            type: "string"
          }
        }
      ],
      logic: {
        config: {
          allowExit: [],
          preferResponse: 200
        },
        middleware: [
          "$DEFAULT"//, "models.packageObjectFull"
        ],
        func: async (ctx, next) => {
          // 1) Check if this is a bundled package
          ctx.state.timecop.start("cache");
          const isBundled = ctx.pulsar.bundled.isNameBundled(ctx.state.params.packageName);
          ctx.state.timecop.end("cache");
          if (isBundled.ok && isBundled.content) {
            const bundledData = ctx.pulsar.bundled.getBundledPackage(ctx.state.params.packageName);

            if (!bundledData.ok) {
              throw new ctx.pulsar.err.InternalServerError("Failed to collect bundled package data", { cause: bundledData });
            }

            ctx.state.output = bundledData.content;
            ctx.status = 200;
            return;
          }

          // 2) Get actual package data
          ctx.state.timecop.start("db.getPackageByName");
          const pack = await ctx.pulsar.db.getPackageByName(
            ctx.state.params.packageName,
            true
          );
          ctx.state.timecop.end("db.getPackageByName");

          if (!pack.ok) {
            // TODO once we allow modules to throw errors directly we won't have to do this
            if (pack.short === "not_found") {
              throw new ctx.pulsar.err.NotFound("Not Found", { cause: pack });
            } else {
              throw new ctx.pulsar.err.InternalServerError("Failed to get package data", { cause: pack });
            }
          }

          // While I'd prefer to use the middleware here, we will manually
          // run the model script, since we filter by engine afterwards.
          // Maybe the right move is to make the engine filter middleware, but
          // I'll have to check how often we use it
          // TODO
          ctx.state.timecop.start("construct");
          let packModel = await ctx.pulsar.models.constructPackageObjectFull(pack.content);

          if (ctx.state.params.engine) {
            packModel = await ctx.pulsar.utils.engineFilter(packModel, ctx.state.params.engine);
          }
          ctx.state.timecop.end("construct");

          ctx.body = packModel;
          ctx.status = 200;
        }
      }
    },
    delete: {
      summary: "Delete a package.",
      responses: {
        204: {
          description: "An empty response, indicating success.",
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
          description: "The name of the package to delete. Must be URL escaped.",
          required: true,
          allowEmptyValue: false,
          example: "authocomplete-powershell",
          schema: {
            type: "string"
          }
        }
      ],
      logic: {
        config: {
          allowExit: [ "auth.verify", "db.getPackageByName", "vcs.ownership" ],
          preferResponse: 204
        },
        middleware: [ "$DEFAULT", "auth.verify", "db.getPackageByName", "vcs.ownership" ],
        func: async (ctx, next) => {
          ctx.state.timecop.start("logic");
          // Since we allow the 'db.getPackageByName' && 'vcs.ownership' checks to fail
          // We don't have to do any error checking and can just delete the package
          const rm = await ctx.pulsar.db.removePackageByName(ctx.state.params.packageName);
          // TODO Technically, to error on the side of safety, either lets be
          // confident in our tests here, or lets flag the package as deleted first
          // (probably just be confident in our tests)
          if (!rm.ok) {
            throw new ctx.pulsar.err.InternalServerError("Failed to delete package", { cause: rm });
          }

          ctx.status = 204;
          ctx.state.timecop.end("logic");
        }
      }
    }
  }
};

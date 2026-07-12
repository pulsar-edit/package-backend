module.exports = {
  "/api/packages/:packageName/versions/:versionName": {
    options: {
      summary: "Define permitted communication options for '/api/packages/:packageName/versions/:versionName'.",
      responses: {
        204: {
          description: "The permitted communication options",
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
      summary: "Get the details of a specific package version.",
      responses: {
        200: {
          description: "The 'package.json' plus more details of a single package version.",
          content: {
            "application/json": "TODO"
          },
          headers: {
            Allow: "$COMPUTE",
            "$DEFAULT": "$COMPUTE",
            "X-Response-Time": "$COMPUTE",
            "Server-Timing": "$COMPUTE",
            "RateLimit-Policy": "$COMPUTE.default"
          }
        }
      },
      parameters: [
        {
          name: "packageName",
          in: "path",
          required: true,
          allowEmptyValue: false,
          schema: {
            type: "string"
          },
          example: "autocomplete-powershell",
          description: "The name of the package to return details for. Must be URL escaped."
        },
        {
          name: "versionName",
          in: "path",
          schema: {
            type: "string"
          },
          required: true,
          allowEmptyValue: false,
          example: "1.0.0",
          description: "The version of the package to access."
        }
      ],
      logic: {
        config: {
          allowExit: [],
          preferResponse: 200
        },
        middleware: [ "$DEFAULT", "models.packageObjectJSON" ],
        func: async (ctx, next) => {
          const pack = await ctx.pulsar.db.getPackageVersionByNameAndVersion(
            ctx.state.params.packageName,
            ctx.state.params.versionName
          );

          if (!pack.ok) {
            // TODO Once we allow modules to throw errors directly, we won't have to do this
            if (pack.short === "not_found") {
              throw new ctx.pulsar.err.NotFound("Not Found", { cause: pack });
            } else {
              throw new ctx.pulsar.err.InternalServerError("Failed to get package & version", { cause: pack });
            }
          }

          ctx.state.output = pack.content;
          ctx.status = 200;
        }
      }
    },
    delete: {
      summary: "Deletes a package version. Once a version is deleted, it cannot be used again.",
      responses: {
        204: {
          description: "An empty response indicating success",
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
          name: "packageName",
          in: "path",
          required: true,
          allowEmptyValue: false,
          schema: {
            type: "string"
          },
          example: "autocomplete-powershell",
          description: "The name of the package to return details for. Must be URL escaped."
        },
        {
          name: "versionName",
          in: "path",
          schema: {
            type: "string"
          },
          required: true,
          allowEmptyValue: false,
          example: "1.0.0",
          description: "The version of the package to access."
        },
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
          allowExit: [ "auth.verify", "db.getPackageByName", "vcs.ownership" ],
          preferResponse: 204
        },
        middleware: [ "$DEFAULT", "auth.verify", "db.getPackageByName", "vcs.ownership" ],
        func: async (ctx, next) => {
          ctx.state.timecop.start("logic");
          // Mark the specified version for deletion
          const removeVersion = await ctx.pulsar.db.removePackageVersion(
            ctx.state.params.packageName,
            ctx.state.params.versionName
          );

          if (!removeVersion.ok) {
            throw new ctx.pulsar.err.InternalServerError("Failed to delete package version", { cause: removeVersion });
          }

          ctx.status = 204;
          ctx.state.timecop.end("logic");
        }
      }
    }
  }
};

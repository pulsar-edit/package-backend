const { performance } = require("node:perf_hooks");
const HttpError = require("http-errors");
const Timecop = require("./timecop.js");

function allowExit(name, ctx) {
  // Determines if the current operation allows this name to terminate the request
  if (ctx.state.operation.logic.config.allowExit.includes(name)) {
    return true;
  } else if (ctx.state.operation.logic.config.denyExit.includes(name)) {
    return false;
  } else {
    // Default to true
    return true;
  }
}

module.exports = {
  ops: {
    insertOperation: (operation) => {
      // InsertOperation is a unique middleware, in that it's not like all the
      // other traditional middleware functions. Instead it's called w/ the full
      // 'Route Operation' and it then returns traditional middleware.
      return async (ctx, next) => {
        ctx.state.operation = operation;
        await next();
      };
    },
    applyParameters: async (ctx, next) => {
      ctx.state.params = {};

      for (const param of ctx.state.operation.parameters) {
        // In realiy, we wouldn't just assign, we should validate against
        // the provided JSON Schema, and check if our validation fails if we
        // are allowed to exit the call
        // TODO
        switch(param.in) {
          case "path":
            ctx.state.params[param.name] = ctx.request.params[param.name];
            break;
          case "header":
            ctx.state.params[param.name] = ctx.request.get(param.name);
            break;
          default:
            break;
        }
      }

      await next();
    },
    applyFuncs: async (ctx, next) => {
      ctx.state.funcs = {};
      await next();
    },
  },
  headers: {
    apply: async (ctx, next) => {
      let headerStore = ctx.state.operation.responses[
        ctx.state.operation.logic.config.responseStatusHeaders ?? "default"
      ].headers;

      for (const header in headerStore) {
        // OpenAPI Headers === Map[string, Header Object | Reference Object]
        if (typeof headerStore[header] === "string") {
          ctx.set(header, headerStore[header]);
        } else if (typeof headerStore[header] === "object") {
          // The object may be a JSON Schema w/ 'default' labeling our value
          // Or it may use the extension `x-pulsar-computed` key
          let value = headerStore[header]?.schema?.default ?? headerStore[header]?.schema?.["x-pulsar-computed"];
          if (value) {
            ctx.set(header, value);
          }
        }
      }

      await next();
    },
    xResponseTime: async (ctx, next) => {
      const start = performance.now();
      await next();
      const ms = performance.now() - start;
      ctx.set("X-Response-Time", `${Number(ms).toFixed(2)}ms`);
    },
    serverTiming: async (ctx, next) => {
      ctx.state.timecop = new Timecop();
      await next();
      let str = ctx.state.timecop.toString();
      if (str) {
        // Conditionally add header, in case cascading functions don't use it
        ctx.set("Server-Timing", str);
      }
    },
  },
  auth: {
    verify: async (ctx, next) => {
      await ctx.state.timecop.time("auth", async () => {
        ctx.state.funcs.auth = ctx.state.funcs.auth || {}; // Conditionally create parent result
        try {
          const user = await ctx.pulsar.auth.verifyAuth(ctx.state.params.Authorization, ctx.pulsar.db);

          if (!user.ok) {
            throw new ctx.pulsar.err.InternalApplicationError("Failed to authenticate the user", { cause: user });
          }

          ctx.state.funcs.auth.verify = user;

        } catch(err) {
          if (allowExit("auth.verify", ctx)) {
            throw HttpError(401, err.toString());
          } else {
            ctx.state.funcs.auth.verify = err;
          }
        }
      });
      await next();
    },
  },
};

const { performance } = require("node:perf_hooks");
const Timecop = require("./timecop.js");

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
      const ms = peformance.now() - start;
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

    },
  },
};

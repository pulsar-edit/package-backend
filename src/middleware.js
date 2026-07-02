/**
 * @module middleware
 */
const { performance } = require("node:perf_hooks");
const HttpError = require("http-errors");
const ratelimit = require("koa-ratelimit");
const Timecop = require("./timecop.js");

const RATE_LIMIT_DBS = {
  default: new Map(),
  auth: new Map()
};

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
  /** @namespace */
  ops: {
    /**
     * @async
     * @memberof ops
     * @function insertOperation
     * @desc A **Special** middleware. In that, this function itself is not valid
     * KoaJS middleware. Instead it returns a valid middleware function, meaning
     * the Route Builder **must** always call this function first.
     * This function takes a full `operation` object (the route operation defined
     * by the routes OpenAPI Specification) and adds it to `ctx.state.operation`.
     * @param {object} operation - Route Operation OpenAPI Specification
     * @returns {function} Valid KoaJS middleware function.
     */
    insertOperation: (operation) => {
      // InsertOperation is a unique middleware, in that it's not like all the
      // other traditional middleware functions. Instead it's called w/ the full
      // 'Route Operation' and it then returns traditional middleware.
      return async (ctx, next) => {
        ctx.state.operation = operation;
        await next();
      };
    },
    /**
     * @async
     * @memberof ops
     * @mixes ops.insertOperation
     * @function applyParameters
     * @desc Takes the `ctx.state.operation` defined parameters and extracts
     * their relevant values from the request object. Any parameters defined
     * via the OpenAPI Specification for the route, are then added to `ctx.state.params`
     * under the exact name they have within the route specification.
     * @param {object} ctx - Context object provided by KoaJS.
     * @param {function} next - Next call provided by KoaJS.
     */
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
    /**
     * @async
     * @memberof ops
     * @function applyFuncs
     * @desc Creates the base `ctx.state.funcs` object, which is later used to
     * store the output of middleware based function calls.
     * Defining it here means no other code has to worry about it's existance.
     * @param {object} ctx - Context object provided by KoaJS.
     * @param {function} next - Next call provided by KoaJS.
     */
    applyFuncs: async (ctx, next) => {
      ctx.state.funcs = {};
      await next();
    },
  },
  rateLimit: {
    default: ratelimit({
      driver: "memory",
      db: RATE_LIMIT_DBS.default,
      duration: 600000,
      errorMessage: 'Sometimes You Just Have to Slow Down.',
      id: (ctx) => ctx.ip,
      headers: {
        remaining: "Rate-Limit-Remaining",
        reset: "Rate-Limit-Reset",
        total: "Rate-Limit-Total"
      },
      max: 100,
      disableHeader: false
    }),
    auth: ratelimit({
      driver: "memory",
      db: RATE_LIMIT_DBS.auth,
      duration: 600000,
      errorMessage: 'Sometimes You Just Have to Slow Down.',
      id: (ctx) => ctx.ip,
      headers: {
        remaining: "RateLimit-Remaining",
        reset: "RateLimit-Reset",
        total: "RateLimit-Limit"
      },
      max: 100,
      disableHeader: false
    })
  },
  /** @namespace */
  headers: {
    /**
     * @async
     * @memberof headers
     * @function apply
     * @mixes ops.insertOperation
     * @desc Uses the headers defined in the routes OpenAPI Specification to
     * add all headers defined to the response object itself.
     * Using either: the string value of the header, the default value of the header's
     * schema, or the `x-pulsar-computed` key on the schema.
     * @param {object} ctx - Context object provided by KoaJS.
     * @param {function} next - Next call provided by KoaJS.
     */
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
    /**
     * @async
     * @memberof headers
     * @function xResponseTime
     * @desc Measures the time taken to complete the request from it's point in
     * the cascade, and adds the `X-Response-Time` header to the response with
     * it's measurement.
     * @param {object} ctx - Context object provided by KoaJS.
     * @param {function} next - Next call provided by KoaJS.
     */
    xResponseTime: async (ctx, next) => {
      const start = performance.now();
      await next();
      const ms = performance.now() - start;
      ctx.set("X-Response-Time", `${Number(ms).toFixed(2)}ms`);
    },
    /**
     * @async
     * @memberof headers
     * @function serverTiming
     * @desc Adds a new `Timecop` class to `ctx.state.timecop`, allowing any
     * other code within the cascade to time their activity via Timecop,
     * then at the end extracts the measurements from Timecop to construct
     * the `Server-Timing` header.
     * @param {object} ctx - Context object provided by KoaJS.
     * @param {function} next - Next call provided by KoaJS.
     */
    serverTiming: async (ctx, next) => {
      ctx.state.timecop = new Timecop();
      await next();
      let str = ctx.state.timecop.toString();
      if (str) {
        // Conditionally add header, in case cascading functions don't use it
        ctx.set("Server-Timing", str);
      }
    },
    /**
     * @async
     * @memberof headers
     * @function rateLimitLegacy
     * @desc If it finds modern Rate Limit headers, it will add the corresponding
     * legacy Rate Limit headers. Matches `express-rate-limit` structure.
     * - RateLimit-Remaining => X-RateLimit-Remaining
     * - RateLimit-Reset => X-RateLimit-Reset
     * - RateLimit-Limit => X-RateLimit-Limit
     * @param {object} ctx - Context object provided by KoaJS.
     * @param {function} next - Next call provided by KoaJS.
     */
    rateLimitLegacy: async (ctx, next) => {
      await next();
      if (ctx.has("RateLimit-Remaining")) {
        ctx.set("X-RateLimit-Remaining", ctx.response.get("RateLimit-Remaining"));
      }
      if (ctx.has("RateLimit-Reset")) {
        ctx.set("X-RateLimit-Reset", ctx.response.get("RateLimit-Reset"));
      }
      if (ctx.has("RateLimit-Limit")) {
        ctx.set("X-RateLimit-Limit", ctx.response.get("RateLimit-Limit"));
      }
    }
  },
  /** @namespace */
  auth: {
    /**
     * @async
     * @memberof auth
     * @implements headers.serverTiming
     * @function verify
     * @desc Collects the `ctx.state.params.Authorization` key, and executes
     * `ctx.pulsar.auth.verifyAuth` with this key. Appending the result of this
     * function call to `ctx.state.funcs.auth.verify`. Which will either be
     * an error, or a response object. Respects Middleware Exit Rules.
     * @param {object} ctx - Context object provided by KoaJS.
     * @param {function} next - Next call provided by KoaJS.
     */
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

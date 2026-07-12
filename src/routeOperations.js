const { getValueAtKeyPath } = require("key-path-helpers");
const shared = require("./controllers/shared.js");
const middleware = require("./middleware.js");

function computeOnRoute(pathsObj) {
  // Store multi-operation values
  const computeValues = {
    allowedMethods: [],
  };

  // === Compute
  for (const pathStr in pathsObj) {
    for (const method in pathsObj[pathStr]) {
      computeValues.allowedMethods.push(method.toUpperCase());
    }
  }

  // === Pre-apply
  // Used to apply computations that may be reused for additional computations
  for (const pathStr in pathsObj) {
    for (const method in pathsObj[pathStr]) {
      for (const responseObj in pathsObj[pathStr][method].responses) {
        // Swap "$DEFAULT" key in headers with 'defaultHeaders' OBJ &
        // delete the original key
        if (
          Object.keys(
            pathsObj[pathStr][method].responses[responseObj].headers
          ).includes("DEFAULT")
        ) {
          pathsObj[pathStr][method].responses[responseObj].headers = {
            ...shared.headers,
            ...pathsObj[pathStr][method].responses[responseObj].headers["$DEFAULT"],
          };

          delete pathsObj[pathStr][method].responses[responseObj].headers["$DEFAULT"];
        }
      }
    }
  }

  // === Apply
  for (const pathStr in pathsObj) {
    for (const method in pathsObj[pathStr]) {
      for (const statusCode in pathsObj[pathStr][method].responses) {
        const responseObj = pathsObj[pathStr][method].responses[statusCode];
        // --- `Allow` Header `$COMPUTE` support
        if (responseObj?.headers?.Allow === "$COMPUTE") {
          responseObj.headers.Allow = computeValues.allowedMethods.join(", ");
        } else if (responseObj?.headers?.Allow?.schema?.["x-pulsar-compute"]) {
          responseObj.headers.Allow.schema["x-pulsar-computed"] === computeValues.allowMethods.join(", ");
        }
        // --- `X-Response-Time` Header `$COMPUTE` support
        if (
          responseObj?.headers?.["X-Response-Time"] === "$COMPUTE" ||
          responseObj?.headers?.["X-Response-Time"]?.schema?.["x-pulsar-compute"]
        ) {
          // Delete Header key to avoid collision with `applyHeaders` middleware
          // THen add new middleware to add header
          delete responseObj.headers["X-Response-Time"];
          pathsObj[pathStr][method].logic.middleware.unshift("headers.xResponseTime");
        }
        // --- `Server-Timing` Header `$COMPUTE` support
        if (
          responseObj?.headers?.["Server-Timing"] === "$COMPUTE" ||
          responseObj?.headers?.["Server-Timing"]?.schema?.["x-pulsar-compute"]
        ) {
          delete responseObj.headers["Server-Timing"];
          pathsObj[pathStr][method].logic.middleware.unshift("headers.serverTiming");
        }
        // --- `RateLimit-Policy` Header `$COMPUTE.auth` support
        if (
          responseObj?.headers?.["RateLimit-Policy"] === "$COMPUTE.auth"
        ) {
          // TODO calculate RateLimit-Policy String
          responseObj.headers["RateLimit-Policy"] = "";
          pathsObj[pathStr][method].logic.middleware.unshift("rateLimit.auth");
        }
        // --- `RateLimit-Policy` Header `$COMPUTE.default` support
        if (
          responseObj?.headers?.["RateLimit-Policy"] === "$COMPUTE.default"
        ) {
          // TODO calculate RateLimit-Policy string
          responseObj.headers["RateLimit-Policy"] = "";
          pathsObj[pathStr][method].logic.middleware.unshift("rateLimit.default");
        }
      }
    }
  }
}

function buildRoute(pathsObj, router) {
  for (const pathStr in pathsObj) {
    for (const method in pathsObj[pathStr]) {
      // Setup middleware
      let mids = [];

      // Handle `$DEFAULT` middleware
      const defaultMiddlewareIdx = pathsObj[pathStr][method].logic.middleware.indexOf("$DEFAULT");
      if (typeof defaultMiddlewareIdx === "number") {
        pathsObj[pathStr][method].logic.middleware.splice(defaultMiddlewareIdx, 1, ...shared.middleware);
      }

      for (const func of pathsObj[pathStr][method].logic.middleware) {
        switch(func) {
          case "ops.insertOperation":
            // `insertOperation` is special, it returns a middleware function,
            // so we must make the initial call here
            mids.push(middleware.ops.insertOperation(pathsObj[pathStr][method]));
            break;
          default:
            mids.push(getValueAtKeyPath(middleware, func));
            break;
        }
      }
      try {
        router[method](pathStr, ...mids, pathsObj[pathStr][method].logic.func);
      } catch(err) {
        console.error("Failed when building routes!");
        console.error(mids);
        console.error(pathStr);
        console.error(pathsObj[pathStr]);
        throw err;
      }
    }
  }
}

function computeOnRoutes(routes) {
  for (const route of routes) {
    computeOnRoute(route);
  }
}

function buildRoutes(routes, router) {
  for (const route of routes) {
    buildRoute(route, router);
  }
}

module.exports = {
  computeOnRoute,
  computeOnRoutes,
  buildRoute,
  buildRoutes,
};

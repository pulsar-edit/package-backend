const express = require("express");
const rateLimit = require("express-rate-limit");
const { MemoryStore } = require("express-rate-limit");

const endpoints = require("./controllers/endpoints.js");
const context = require("./context.js");
const buildContext = require("./buildContext.js");

const app = express();

// Define our Basic Rate Limiters
const genericLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Limit each IP per window, 0 disables rate limit
  max:
    process.env.PULSAR_STATUS === "dev" ? 0 : context.config.RATE_LIMIT_GENERIC,
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: true, // Legacy rate limit info in headers
  store: new MemoryStore(), // use default memory store
  message: "Too many requests, please try again later.", // Message once limit is reached
  statusCode: 429, // HTTP Status code once limit is reached
  handler: (request, response, next, options) => {
    response.status(options.statusCode).json({ message: options.message });
    context.logger.httpLog(request, response);
  },
});

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Limit each IP per window, 0 disables rate limit.
  max: process.env.PULSAR_STATUS === "dev" ? 0 : context.config.RATE_LIMIT_AUTH,
  standardHeaders: true, // Return rate limit info on headers
  legacyHeaders: true, // Legacy rate limit info in headers
  store: new MemoryStore(), // use default memory store
  message: "Too many requests, please try again later.", // message once limit is reached
  statusCode: 429, // HTTP Status code once limit is reached.
  handler: (request, response, next, options) => {
    response.status(options.statusCode).json({ message: options.message });
    context.logger.httpLog(request, response);
  },
});

// Set express defaults

app.set("trust proxy", true);

app.use("/swagger-ui", express.static("docs/swagger"));

const endpointHandlerV2 = async function (node, req, res) {
  const ctx = buildContext(req, res, node);

  if (typeof node.preLogic === "function") {
    await node.preLogic(ctx);
  }

  let obj; // Logic return
  try {
    obj = await node.logic(ctx);
  } catch(err) {
    // Main logic of endpoint has failed, return gracefully
    obj = new ctx.sso();
    obj.notOk()
       .addContent(err)
       .addMessage("An unexpected error has occurred.")
       .addShort("server_error");
  }

  if (typeof node.postLogic === "function") {
    await node.postLogic(ctx);
  }

  // Before letting SSO take over the HTTP return, lets add headers
  for (const header in node.headers) {
    if (node.headers[header].startsWith("%")) {
      // This is a replacement header value
      const headerFuncCall = node.headers[header].replace("%", "");

      // Drill down keypath defined in the func call
      let headerCallCtx = ctx;
      const namespaces = headerFuncCall.split(".");
      let func = namespaces.pop();
      for (let i = 0; i < namespaces.length; i++) {
        headerCallCtx = headerCallCtx[namespaces[i]];
      }

      let headerFuncResult;

      if (typeof headerCallCtx[func] === "function") {
        headerFuncResult = headerCallCtx[func]();
      } else {
        console.log(`Couldn't locate value for header: Key: ${header}; Value: ${node.headers[header]}`);
        headerFuncResult = "";
      }

      res.append(header, headerFuncResult);
    } else {
      res.append(header, node.headers[header]);
    }
  }
  obj.handleReturnHTTP(req, res, context);

  if (typeof node.postReturnHTTP === "function") {
    await node.postReturnHTTP(ctx, obj);
  }

  return;
};

const endpointHandler = async function (node, req, res) {
  let params = {};

  for (const param in node.params) {
    params[param] = node.params[param](context, req);
  }

  if (typeof node.preLogic === "function") {
    await node.preLogic(req, res, context);
  }

  let obj;

  try {
    if (node.endpoint.endpointKind === "raw") {
      await node.logic(req, res, context);
      // If it's a raw endpoint, they must handle all other steps manually
      return;
    } else {
      obj = await node.logic(params, context);
    }
  } catch (err) {
    // The main logic request has failed. We will generate our own return obj,
    // and exit.
    obj = new context.sso();
    obj
      .notOk()
      .addContent(err)
      .addMessage("An unexpected error has occurred.")
      .addShort("server_error");
  }

  if (typeof node.postLogic === "function") {
    await node.postLogic(req, res, context);
  }

  obj.addGoodStatus(node.endpoint.successStatus);

  obj.handleReturnHTTP(req, res, context);

  if (typeof node.postReturnHTTP === "function") {
    await node.postReturnHTTP(req, res, context, obj);
  }

  return;
};

// Setup all endpoints

const pathOptions = [];

for (const node of endpoints) {
  let paths;

  if (node.version === 2) {
    if (!Array.isArray(node.endpoint.path)) {
      paths = [node.endpoint.path];
    } else {
      paths = node.endpoint.path;
    }
  } else {
    // implict V1
    paths = node.endpoint.paths;
  }

  for (const path of paths) {
    let limiter = genericLimit;
    // TODO should v2 endpoints determine ratelimit by strings like this?
    // Or by decoding a `RateLimit-Policy` header?
    if (node.endpoint.rateLimit === "auth") {
      limiter = authLimit;
    } else if (node.endpoint.rateLimit === "generic") {
      limiter = genericLimit;
    }

    if (!pathOptions.includes(path)) {
      app.options(path, genericLimit, async (req, res) => {
        let headerObj;

        if (node.version === 2) {
          headerObj = node.headers;
          // TODO handle header value replacements
        } else {
          // v1
          headerObj = node.endpoint.options;
        }

        res.header(headerObj);
        res.sendStatus(204);
        return;
      });

      pathOptions.push(path);
    }

    let handlerFunc = endpointHandler;

    if (node.version === 2) {
      handlerFunc = endpointHandlerV2;
    }

    switch (node.endpoint.method) {
      case "GET":
        app.get(path, limiter, async (req, res) => {
          await handlerFunc(node, req, res);
        });
        break;
      case "POST":
        app.post(path, limiter, async (req, res) => {
          await handlerFunc(node, req, res);
        });
        break;
      case "DELETE":
        app.delete(path, limiter, async (req, res) => {
          await handlerFunc(node, req, res);
        });
        break;
      default:
        console.log(`Unsupported method: ${node.endpoint.method} for ${path}`);
    }
  }
}

app.use(async (err, req, res, next) => {
  // Having this as the last route, will handle all other unkown routes.
  // Ensure we leave this at the very last position to handle properly.
  // We can also check for any unhandled errors passed down the endpoint chain

  if (err) {
    console.error(
      `An error was encountered handling the request: ${err.toString()}`
    );
    await context.common_handler.serverError(req, res, err);
    return;
  }

  context.common_handler.siteWideNotFound(res, res);
});

module.exports = app;

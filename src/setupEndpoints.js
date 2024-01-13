const express = require("express");
const rateLimit = require("express-rate-limit");
const { MemoryStore } = require("express-rate-limit");

const endpoints = require("./controllers/endpoints.js");
const context = require("./context.js");

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
  for (const path of node.endpoint.paths) {
    let limiter = genericLimit;

    if (node.endpoint.rateLimit === "auth") {
      limiter = authLimit;
    } else if (node.endpoint.rateLimit === "generic") {
      limiter = genericLimit;
    }

    if (!pathOptions.includes(path)) {
      app.options(path, genericLimit, async (req, res) => {
        res.header(node.endpoint.options);
        res.sendStatus(204);
        return;
      });

      pathOptions.push(path);
    }

    switch (node.endpoint.method) {
      case "GET":
        app.get(path, limiter, async (req, res) => {
          await endpointHandler(node, req, res);
        });
        break;
      case "POST":
        app.post(path, limiter, async (req, res) => {
          await endpointHandler(node, req, res);
        });
        break;
      case "DELETE":
        app.delete(path, limiter, async (req, res) => {
          await endpointHandler(node, req, res);
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

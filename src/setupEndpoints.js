const express = require("express");
const rateLimit = require("express-rate-limit");
const { MemoryStore } = require("express-rate-limit");

const app = express();

const endpoints = [
  require("./controllers/getStars.js"),
  require("./controllers/getThemes.js"),
  require("./controllers/getThemesFeatured.js"),
  require("./controllers/getUpdates.js"),
  require("./controllers/getUsers.js"),
  require("./controllers/getusersLogin.js"),
  require("./controllers/getUsersLoginStars.js"),
  require("./controllers/postPackagesPackageNameVersionsVersionNameEventsUninstall.js")
];

// The CONST Context - Enables access to all other modules within the system
// By passing this object to everywhere needed allows not only easy access
// but greater control in mocking these later on
const context = {
  logger: require("./logger.js"),
  database: require("./database.js"),
  webhook: require("./webhook.js"),
  server_version: require("../package.json").version,
  query: require("./query.js"),
  vcs: require("./vcs.js"),
  config: require("./config.js").getConfig(),
  common_handler: require("./handlers/common_handler.js"),
  utils: require("./utils.js"),
  sso: require("./models/sso.js"),
  ssoPaginate: require("./models/ssoPaginate.js"),
  ssoRedirect: require("./models/ssoRedirect.js")
};

// Define our Basic Rate Limiters
const genericLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Limit each IP per window, 0 disables rate limit
  max: process.env.PULSAR_STATUS === "dev" ? 0 : context.config.RATE_LIMIT_GENERIC,
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: true, // Legacy rate limit info in headers
  store: new MemoryStore(), // use default memory store
  message: "Too many requests, please try again later.", // Message once limit is reached
  statusCode: 429, // HTTP Status code once limit is reached
  handler: (request, response, next, options) => {
    response.status(options.statusCode).json({ message: options.message });
    context.logger.httpLog(request, response);
  }
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
  }
});

// Set express defaults

app.set("trust proxy", true);

app.use("/swagger-ui", express.static("docs/swagger"));

// Setup all endpoints

for (const node of endpoints) {

  for (const path of node.endpoint.paths) {

    let limiter = genericLimit;

    if (node.endpoint.rateLimit === "auth") {
      limiter = authLimit;
    } else if (node.endpoint.rateLimit === "generic") {
      limiter = genericLimit;
    }

    // Don't break on switch, so default can provide `OPTIONS` endpoint
    switch(node.endpoint.method) {
      case "GET":
        app.get(path, limiter, async (req, res) => {
          let params = {};

          for (const param in node.params) {
            params[param] = node.params[param](context, req);
          }

          if (typeof node.preLogic === "function") {
            node.preLogic(req, res, context);
          }

          let obj = await node.logic(params, context);

          if (typeof node.postLogic === "function") {
            node.postLogic(req, res, context);
          }

          obj.addGoodStatus(node.endpoint.successStatus);

          obj.handleReturnHTTP(req, res, context);
          return;
        });
      case "POST":
        app.post(path, limiter, async (req, res) => {
          let params = {};

          for (const param in node.params) {
            params[param] = node.params[param](context, req);
          }

          if (typeof node.preLogic === "function") {
            node.preLogic(req, res, context);
          }

          let obj = await node.logic(params, context);

          if (typeof node.postLogic === "function") {
            node.postLogic(req, res, context);
          }

          obj.addGoodStatus(node.endpoint.successStatus);

          obj.handleReturnHTTP(req, res, context);
          return;
        });
      case "DELETE":
        app.delete(path, limiter, async (req, res) => {
          let params = {};

          for (const param in node.params) {
            params[param] = node.params[param](context, req);
          }

          if (typeof node.preLogic === "function") {
            node.preLogic(req, res, context);
          }

          let obj = await node.logic(params, context);

          if (typeof node.postLogic === "function") {
            node.postLogic(req, res, context);
          }

          obj.addGoodStatus(node.endpoint.successStatus);

          obj.handleReturnHTTP(req, res, context);
          return;
        });
      default:
        app.options(path, genericLimit, async (req, res) => {
          res.header(node.endpoint.options);
          res.sendStatus(204);
          return;
        });
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

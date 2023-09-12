// The CONST Context - Enables access to all other modules within the system
// By passing this object to everywhere needed allows not only easy access
// but greater control in mocking these later on
module.exports = {
  logger: require("./logger.js"),
  database: require("./database.js"),
  webhook: require("./webhook.js"),
  server_version: require("../package.json").version,
  query: require("./query.js"),
  vcs: require("./vcs.js"),
  config: require("./config.js").getConfig(),
  common_handler: require("./handlers/common_handler.js"),
  utils: require("./utils.js"),
  auth: require("./auth.js"),
  sso: require("./models/sso.js"),
  ssoPaginate: require("./models/ssoPaginate.js"),
  ssoRedirect: require("./models/ssoRedirect.js"),
  ssoHTML: require("./models/ssoHTML.js")
};

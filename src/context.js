// The CONST Context - Enables access to all other modules within the system
// By passing this object to everywhere needed allows not only easy access
// but greater control in mocking these later on
const Timecop = require("./models/timecop.js");

const CTX = {
  logger: require("./logger.js"),
  database: require("./database/_export.js"),
  webhook: require("./webhook.js"),
  server_version: require("../package.json").version,
  query: require("./query_parameters/index.js").logic,
  vcs: require("./vcs.js"),
  config: require("./config.js").getConfig(),
  utils: require("./utils.js"),
  auth: require("./auth.js"),
  bundled: require("./bundled_packages/index.js"),
  sso: require("./models/sso.js"),
  ssoPaginate: require("./models/ssoPaginate.js"),
  ssoRedirect: require("./models/ssoRedirect.js"),
  ssoHTML: require("./models/ssoHTML.js"),
  callStack: require("./models/callStack.js"),
  models: {
    constructPackageObjectFull: require("./models/constructPackageObjectFull.js"),
    constructPackageObjectShort: require("./models/constructPackageObjectShort.js"),
    constructPackageObjectJSON: require("./models/constructPackageObjectJSON.js"),
  },
};

module.exports = {
  // === Simple Context Object, ControllerV1: Simple Object
  obj: CTX,
  // === On Demand Built Object, ControllerV2: Takes req, res, params objects and returns
  // A context as the "World"
  build(req, res, params) {
    return {
      req: req,
      res: res,
      params: params,
      timecop: new Timecop(),
      ...CTX,
      callStack: new CTX.callStack(), // Put after spread operator on CTX so it
        // overwrites the original callStack
    };
  }
};

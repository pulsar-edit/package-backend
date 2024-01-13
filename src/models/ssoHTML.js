const SSO = require("./sso.js");

module.exports = class SSOHTML extends SSO {
  constructor() {
    super();
  }

  handleSuccess(req, res, context) {
    res.send(this.content);
    context.logger.httpLog(req, res);
  }
};

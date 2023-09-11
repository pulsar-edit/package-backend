const SSO = require("./sso.js");

module.exports =
class SSORedirect extends SSO {
  constructor() {
    super();
  }

  handleSuccess(req, res, context) {
    res.redirect(this.content);
    context.logger.httpLog(req, res);
  }
}

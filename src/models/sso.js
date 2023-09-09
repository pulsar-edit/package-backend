const { performance } = require("node:perf_hooks");

module.exports =
class SSO {
  constructor() {
    this.ok = false;
    this.content;
    this.short;
    this.safeContent = false;
    this.successStatusCode = 200;
    this.calls = {};
  }

  isOk() {
    this.ok = true;
    return this;
  }

  notOk() {
    this.ok = false;
    return this;
  }

  addContent(content, safe) {
    if (typeof safe === "boolean") {
      this.safeContent = safe;
    }

    this.content = content;
    return this;
  }

  addCalls(id, content) {
    this.calls[id] = {
      content: content,
      time: performance.now()
    };
    return this;
  }

  addShort(enum) {
    // TODO Validate enum being assigned
    this.short = enum;
    return this;
  }

  addGoodStatus(status) {
    this.successStatusCode = status;
    return this;
  }

  handleReturnHTTP(req, res, context) {
    if (!this.ok) {
      this.handleError(req, res, context);
      return;
    }

    this.handleSuccess(req, res, context);
    return;
  }

  handleError(req, res, context) {
    // TODO Get rid of the common error handler, and put all the logic here
    await context.common_handler.handleError(req, res, this.content);
    return;
  }

  handleSuccess(req, res, context) {

    res.status(this.successStatusCode).json(this.content);
    context.logger.httpLog(req, res);
    return;
  }
}

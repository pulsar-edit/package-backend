const { performance } = require("node:perf_hooks");
const util = require("util");

const validEnums = [
  "not_found",
  "server_error",
  "not_supported",
  "unauthorized",
  "bad_repo",
  "package_exists",
];

const enumDetails = {
  not_found: {
    code: 404,
    message: "Not Found",
  },
  server_error: {
    code: 500,
    message: "Application Error",
  },
  not_supported: {
    code: 501,
    message: "While under development this feature is not supported.",
  },
  unauthorized: {
    code: 401,
    message: "Unauthorized",
  },
  bad_repo: {
    code: 400,
    message: "That repo does not exist, or is inaccessible",
  },
  package_exists: {
    code: 409,
    message: "A Package by that name already exists.",
  },
};

module.exports = class SSO {
  constructor() {
    this.ok = false;
    this.content = {};
    this.short = "";
    this.message = "";
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
      time: performance.now(),
    };
    return this;
  }

  assignCalls(content) {
    this.calls = content;
    return this;
  }

  addShort(enumValue) {
    if (
      this.short?.length <= 0 &&
      typeof enumValue === "string" &&
      validEnums.includes(enumValue)
    ) {
      // Only assign short once
      this.short = enumValue;
    }
    return this;
  }

  addMessage(msg) {
    this.message = msg;
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
    console.log(util.inspect(this, { showHidden: false, depth: null }));

    let shortToUse, msgToUse, codeToUse;

    if (typeof this.short === "string" && this.short.length > 0) {
      // Use the short given to us during the build stage
      shortToUse = this.short;
    } else if (
      typeof this.content?.short === "string" &&
      this.content.short.length > 0
    ) {
      // Use the short that's bubbled up from other calls
      shortToUse = this.content.short;
    } else {
      // Use the default short
      shortToUse = "server_error";
    }

    // Now that we have our short, we must determine the text of our message.
    msgToUse =
      enumDetails[shortToUse]?.message ?? `Server Error: From ${shortToUse}`;

    codeToUse = enumDetails[shortToUse]?.code ?? 500;

    if (typeof this.message === "string" && this.message.length > 0) {
      msgToUse += `: ${this.message}`;
    }
    // TODO We should make use of our `calls` here.
    // Not only for logging more details.
    // But we also could use this to get more information to return. Such as
    // providing helpful error logs and such.

    res.status(codeToUse).json({
      message: msgToUse,
    });

    // TODO Log our error too!
    context.logger.httpLog(req, res);
    return;
  }

  handleSuccess(req, res, context) {
    if (typeof this.content === "boolean" && this.content === false) {
      res.status(this.successStatusCode).send();
    } else {
      res.status(this.successStatusCode).json(this.content);
    }
    context.logger.httpLog(req, res);
    return;
  }
};

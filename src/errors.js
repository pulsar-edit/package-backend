
class InternalApplicationError extends Error {
  constructor(msg, opts) {
    super(msg);
    this.name = "InternalApplicationError";

    if (opts.cause) {
      this.cause = opts.cause;
    }
  }
}

class Unauthorized extends Error {
  constructor(msg = "Unauthorized", opts) {
    super(msg);
    this.name = "Unauthorized";
    this.status = 401;

    if (opts.cause) {
      this.cause = opts.cause;
    }
  }
}

class NotFound extends Error {
  constructor(msg = "Not Found", opts) {
    super(msg);
    this.name = "NotFound";
    this.status = 404;

    if (opts.cause) {
      this.cause = opts.cause;
    }
  }
}

module.exports = {
  InternalApplicationError,
  Unauthorized,
  NotFound,
};

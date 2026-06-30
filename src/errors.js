
class InternalApplicationError extends Error {
  constructor(msg, opts) {
    super(msg);
    this.name = "InternalApplicationError";

    if (opts.cause) {
      this.cause = opts.cause;
    }
  }
}

module.exports = {
  InternalApplicationError,
};

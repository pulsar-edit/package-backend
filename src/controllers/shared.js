
module.exports = {
  headers: {
    "Content-Type": {
      description: "Indicates the original media type of the returned data.",
      schema: {
        type: "string",
        default: "application/json",
        "$comment": "RFC9110 8.3"
      }
    },
    "X-Content-Type-Operations": "nosniff"
  },
  middleware: [
    "ops.insertOperation", "headers.apply", "ops.applyParameters", "ops.applyFuncs", "headers.rateLimitLegacy"
  ]
};

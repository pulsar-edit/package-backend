const engine = require("./engine.js").logic;

module.exports = {
  schema: {
    name: "versionName",
    in: "path",
    schema: {
      type: 'string"',
    },
    required: true,
    allowEmptyValue: false,
    example: "1.0.0",
    description: "The version of the package to access",
  },
  logic: engine,
};

module.exports = {
  name: "engine",
  in: "query",
  schema: {
    type: "string"
  },
  example: "1.0.0",
  allowEmptyValue: true,
  description: "Only show packages compatible with this Pulsar version. Must be a valid Semver."
};

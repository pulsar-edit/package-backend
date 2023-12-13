module.exports = {
  name: "versionName",
  in: "path",
  schema: {
    type: "string"
  },
  required: true,
  allowEmptyValue: false,
  example: "1.0.0",
  description: "The version of the package to access."
};

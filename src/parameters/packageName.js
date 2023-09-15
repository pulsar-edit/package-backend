module.exports = {
  name: "packageName",
  in: "path",
  schema: {
    type: "string"
  },
  required: true,
  allowEmptyValue: false,
  example: "autocomplete-powershell",
  description: "The name of the package to return details for. Must be URL escaped."
};

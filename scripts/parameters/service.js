module.exports = {
  name: "service",
  in: "query",
  schema: {
    type: "string"
  },
  example: "autocomplete.watchEditor",
  allowEmptyValue: true,
  description: "The service of which to filter packages by."
};

module.exports = {
  name: "serviceVersion",
  in: "query",
  schema: {
    type: "string"
  },
  example: "0.0.1",
  allowEmptyValue: true,
  description: "Filter by a specific version of the 'service'."
};

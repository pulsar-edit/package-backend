module.exports = {
  name: "page",
  in: "query",
  schema: {
    type: "number",
    minimum: 1,
    default: 1
  },
  example: 1,
  allowEmptyValue: true,
  description: "The page of available results to return."
};

module.exports = {
  name: "sort",
  in: "query",
  schema: {
    type: "string",
    enum: [
      "downloads",
      "created_at",
      "updated_at",
      "stars",
      "relevance"
    ],
    default: "relevance"
  },
  example: "downloads",
  allowEmptyValue: true,
  description: "Method to sort the results."
};

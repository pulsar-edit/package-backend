module.exports = {
  name: "direction",
  in: "query",
  schema: {
    type: "string",
    enum: [
      "desc",
      "asc"
    ],
    default: "desc"
  },
  example: "desc",
  allowEmptyValue: true,
  description: "Direction to list search results."
};

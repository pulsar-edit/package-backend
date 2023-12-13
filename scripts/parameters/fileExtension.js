module.exports = {
  name: "fileExtension",
  in: "query",
  schema: {
    type: "string"
  },
  example: "coffee",
  allowEmptyValue: true,
  description: "File extension of which to only show compatible grammar package's of."
};

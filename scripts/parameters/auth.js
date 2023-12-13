module.exports = {
  name: "auth",
  in: "header",
  schema: {
    type: "string"
  },
  required: true,
  allowEmptyValue: false,
  description: "Authorization Headers."
};

module.exports = {
  name: "serviceType",
  in: "query",
  schema: {
    type: "string",
    enum: [
      "consumed",
      "provided"
    ]
  },
  example: "consumed",
  allowEmptyValue: true,
  description: "Chooses whether to display 'consumer' or 'provider's of the specified 'service'."
};
// TODO determine if there's a way to indicate this is a required field when
// using the 'service' query param.

module.exports = {
  schema: {
    description: "A generic object that could contain status information or error messages.",
    type: "object",
    required: [
      "message"
    ],
    properties: {
      message: {
        type: "string"
      }
    }
  },
  example: {
    message: "This is some message content."
  },
  test:
    Joi.object({
      message: Joi.string().required()
    })
};

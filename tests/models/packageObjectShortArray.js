module.exports = {
  schema: {
    type: "array",
    items: {
      $ref: "#/components/schemas/packageObjectShort",
    },
  },
  example: [require("./packageObjectShort.js").example],
  test: Joi.array().items(require("./packageObjectShort.js").test).required(),
};

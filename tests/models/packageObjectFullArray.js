module.exports = {
  schema: {
    type: "array",
    items: {
      $ref: "#/components/schemas/packageObjectFull",
    },
  },
  example: [require("./packageObjectFull.js").example],
  test: Joi.array().items(require("./packageObjectFull.js").test).required(),
};

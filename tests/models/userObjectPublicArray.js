module.exports = {
  schema: {
    type: "array",
    items: {
      $ref: "#/components/schemas/userObjectPublic",
    },
  },
  example: [require("./userObjectPublic.js").example],
  test: Joi.array().items(require("./userObjectPublic.js").test).required(),
};

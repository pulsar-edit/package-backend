module.exports = {
  schema: {},
  example: [require("./packageObjectFull.js").example],
  test: Joi.array().items(require("./packageObjectFull.js").test).required(),
};

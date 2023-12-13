module.exports = {
  schema: {

  },
  example: [
    require("./packageObjectShort.js").example
  ],
  test:
    Joi.array().items(
      require("./packageObjectShort.js").test
    ).required()
};

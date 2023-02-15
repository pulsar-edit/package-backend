const ServerStatus = require("../src/ServerStatusObject.js");
const Joi = require("joi");

describe("Building Objects with ServerStatus Return as Expected", () => {
  test("Formal usage", () => {
    const obj = new ServerStatus().isOk().setContent("Hello World").build();

    const schema = Joi.object()
      .keys({
        ok: Joi.boolean().required(),
        content: Joi.string().required(),
      })
      .required();

    expect(obj).toMatchSchema(schema);
    expect(obj.content).toBe("Hello World");
    expect(obj.ok).toBe(true);
  });

  test("Not OK Formal Usage", () => {
    const obj = new ServerStatus()
      .notOk()
      .setContent("Hello World")
      .setShort("We had an error")
      .build();

    const schema = Joi.object()
      .keys({
        ok: Joi.boolean().required(),
        content: Joi.string().required(),
        short: Joi.string().required(),
      })
      .required();

    expect(obj).toMatchSchema(schema);
    expect(obj.ok).toBe(false);
    expect(obj.short).toBe("We had an error");
    expect(obj.content).toBe("Hello World");
  });
});

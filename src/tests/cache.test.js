const cache = require("../cache.js");
const Joi = require("joi");
const jestJoi = require("jest-joi");

expect.extend(jestJoi.matchers);

test("Cache Creates Object As Expected", async () => {
  let newCache = new cache.CacheObject("test-contents");
  expect(typeof newCache === "object").toBeTruthy();
});

describe("Cache Objects Have the Functions and Variables Expected", () => {
  let newCache = new cache.CacheObject("test-contents", "test-name");

  test("Cache Object Contains Object Values Expected", async () => {

    const schema = Joi.object().keys({
      birth: Joi.number().integer().required(),
      data: Joi.string().required(),
      invalidated: Joi.boolean().required(),
      last_validate: Joi.number().integer().required(),
      cache_time: Joi.number().integer().required(),
      name: Joi.string().required()
    }).required();

    expect(newCache).toMatchSchema(schema);
  });

  test("Cache Object Contains Contents as Instantiated", async () => {
    expect(newCache.data).toEqual("test-contents");
  });

  test("Cache Object Data is not Invalidated Via Variable", async () => {
    expect(newCache.invalidated).toEqual(false);
  });

  test("Cache Object contains Name as Instantiated", async () => {
    expect(newCache.name).toEqual("test-name");
  });

  test("Cache Object Contains Function 'invalidate'", async () => {
    expect(typeof newCache.invalidate === "function").toBeTruthy();
  });

  test("Cache Object Returns Boolean for Expired", async () => {
    let exp = newCache.Expired;
    expect(typeof exp === "boolean").toBeTruthy();
  });

  test("Cache Object Changes variable when calling 'invalidate'", async () => {
    newCache.invalidate();
    expect(newCache.invalidated).toBeTruthy();
  });
});

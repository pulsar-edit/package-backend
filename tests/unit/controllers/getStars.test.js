const endpoint = require("../../../src/controllers/getStars.js");
const context = require("../../../src/context.js");

describe("Has features expected", () => {
  test("Has correct endpoint features", () => {
    const expected = {
      method: "GET",
      paths: [ "/api/stars" ],
      rateLimit: "generic",
      successStatus: 200
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });
});

describe("Returns as expected", () => {
  test("When 'auth.verifyAuth' fails", async () => {
    const localContext = context;
    localContext.auth = {
      verifyAuth: () => { return { ok: false, content: "Test Failure" }; }
    };

    const res = await endpoint.logic({}, localContext);

    expect(res.ok).toBe(false);
    expect(res.content).toBeDefined();
    expect(res.content.content).toBe("Test Failure");
  });
});

const endpoint = require("../../src/controllers/postPackagesPackageNameVersionsVersionNameEventsUninstall.js");
const context = require("../../src/context.js");

describe("Has features expected", () => {
  test("Has correct endpoint features", () => {
    const expected = {
      method: "POST",
      rateLimit: "auth",
      successStatus: 201
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });
});

describe("Returns as expected", () => {
  test("Returns simple OK object", async () => {
    const res = await endpoint.logic({}, context);

    expect(res.ok).toBe(true);
    expect(res.content).toBeDefined();
    expect(res.content.ok).toBe(true);
  });
});

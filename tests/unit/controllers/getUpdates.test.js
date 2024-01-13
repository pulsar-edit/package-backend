const endpoint = require("../../../src/controllers/getUpdates.js");

describe("Has features expected", () => {
  test("Has correct endpoint features", () => {
    const expected = {
      method: "GET",
      rateLimit: "generic",
      successStatus: 200,
      paths: ["/api/updates"],
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });

  test("Has correct functions", () => {
    expect(endpoint.logic).toBeTypeof("function");
  });
});

describe("Functions as expected", () => {
  test("Returns correct SSO Object", async () => {
    const sso = await endpoint.logic({}, require("../../../src/context.js"));

    expect(sso.ok).toBe(false);
    expect(sso.short).toBe("not_supported");
  });
});

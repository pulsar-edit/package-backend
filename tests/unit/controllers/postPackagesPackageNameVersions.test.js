const endpoint = require("../../../src/controllers/postPackagesPackageNameVersions.js");

describe("Has features expected", () => {
  test("Has correct endpoint features", () => {
    const expected = {
      method: "POST",
      rateLimit: "auth",
      successStatus: 201,
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });
});

const endpoint = require("../../../src/controllers/deletePackagesPackageNameVersionsVersionName.js");

describe("Has features expected", () => {
  test("endpoint features", () => {
    const expected = {
      method: "DELETE",
      paths: [
        "/api/packages/:packageName/versions/:versionName",
        "/api/themes/:packageName/versions/:versionName",
      ],
      rateLimit: "auth",
      successStatus: 204,
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });

  test("correct functions", () => {
    expect(endpoint.logic).toBeTypeof("function");
  });
});

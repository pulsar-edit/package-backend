const endpoint = require("../../../src/controllers/deletePackagesPackageName.js");

describe("Has features expected", () => {
  test("endpoint features", () => {
    const expected = {
      method: "DELETE",
      paths: [ "/api/packages/:packageName", "/api/themes/:packageName" ],
      rateLimit: "auth",
      successStatus: 204
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });

  test("correct functions", () => {
    expect(endpoint.logic).toBeTypeof("function");
  });
});

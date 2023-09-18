const endpoint = require("../../../src/controllers/getRoot.js");

describe("Has features expected", () => {
  test("Has correct endpoint features", () => {
    const expected = {
      method: "GET",
      paths: [ "/" ],
      rateLimit: "generic",
      successStatus: 200
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });

  test("Has correct functions", () => {
    expect(endpoint.logic).toBeTypeof("function");
  });
});

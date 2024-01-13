const endpoint = require("../../../src/controllers/getUsersLogin.js");
const context = require("../../../src/context.js");

describe("Has features expected", () => {
  test("Has correct endpoint features", () => {
    const expected = {
      method: "GET",
      paths: ["/api/users/:login"],
      rateLimit: "generic",
      successStatus: 200,
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });
});

describe("Parameters function as expected", () => {
  test("Returns params as provided", () => {
    const req = {
      params: {
        login: "test-user",
      },
    };

    const res = endpoint.params.login(context, req);

    expect(res).toBe("test-user");
  });

  test("Returns params when missing", () => {
    const req = { params: {} };

    const res = endpoint.params.login(context, req);

    expect(res).toBe("");
  });
});

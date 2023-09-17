const endpoint = require("../../../src/controllers/getUsers.js");
const context = require("../../../src/context.js");

describe("Has features expected", () => {
  test("Has correct endpoint features", () => {
    const expected = {
      method: "GET",
      paths: [ "/api/users" ],
      rateLimit: "auth",
      successStatus: 200
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });

  test("Has correct functions", () => {
    expect(endpoint.logic).toBeTypeof("function");
    expect(endpoint.preLogic).toBeTypeof("function");
    expect(endpoint.postLogic).toBeTypeof("function");
  });
});

describe("Parameters function as expected", () => {
  test("Returns params as provided", () => {
    const req = {
      get: (wants) => {
        if (wants === "Authorization") {
          return "Auth-Token";
        } else {
          return "";
        }
      }
    };

    const res = endpoint.params.auth(context, req);

    expect(res).toBe("Auth-Token");
  });

  test("Returns params when missing", () => {
    const req = {
      get: () => { return ""; }
    };

    const res = endpoint.params.auth(context, req);

    expect(res).toBe("");
  });
});

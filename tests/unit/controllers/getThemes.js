const endpoint = require("../../../src/controllers/getThemes.js");
const context = require("../../../src/context.js");

describe("Has features expected", () => {
  test("Has correct endpoint features", () => {
    const expected = {
      method: "GET",
      paths: [ "/api/themes" ],
      rateLimit: "generic",
      successStatus: 200
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });

  test("Has correct functions", () => {
    expect(endpoint.logic).toBeTypeof("function");
  });
});

describe("Parameters behave as expected", () => {
  test("Returns valid 'page'", () => {
    const req = {
      params: {
        page: "1"
      }
    };

    const res = endpoint.params.page(context, req);
    expect(res).toBe("1");
  });
  test("Returns valid 'sort'", () => {
    const req = {
      params: {
        sort: "downloads"
      }
    };

    const res = endpoint.params.sort(context, req);
    expect(res).toBe("downloads");
  });
  test("Returns valid 'direction'", () => {
    const req = {
      params: {
        direction: "desc"
      }
    };

    const res = endpoint.params.direction(context, req);
    expect(res).toBe("desc");
  });
});

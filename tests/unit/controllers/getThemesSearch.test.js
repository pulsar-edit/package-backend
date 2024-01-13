const endpoint = require("../../../src/controllers/getThemesSearch.js");
const context = require("../../../src/context.js");

describe("Has features expected", () => {
  test("Has correct endpoint features", () => {
    const expected = {
      method: "GET",
      paths: ["/api/themes/search"],
      rateLimit: "generic",
      successStatus: 200,
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });

  test("Has correct functions", () => {
    expect(endpoint.logic).toBeTypeof("function");
  });
});

describe("Parameters behave as expected", () => {
  test("Returns valid 'sort'", () => {
    const req = {
      query: { sort: "downloads" },
    };

    const res = endpoint.params.sort(context, req);
    expect(res).toBe("downloads");
  });
  test("Returns valid 'page'", () => {
    const req = {
      query: { page: "1" },
    };

    const res = endpoint.params.page(context, req);
    expect(res).toBe(1);
  });
  test("Returns valid 'direction'", () => {
    const req = {
      query: { direction: "desc" },
    };

    const res = endpoint.params.direction(context, req);
    expect(res).toBe("desc");
  });
  test("Returns valid 'query'", () => {
    const req = {
      query: { q: "hello" },
    };

    const res = endpoint.params.query(context, req);
    expect(res).toBe("hello");
  });
});

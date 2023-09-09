const getThemes = require("../../src/controllers/getThemes.js");

describe("Returns the expected query parameters", () => {
  test("with empty request object", () => {
    const req = { query: {} };
    const context = {
      query: require("../../src/query.js")
    };

    const ret = getThemes.params(req, context);

    expect(ret.page).toBeDefined();
    expect(ret.sort).toBeDefined();
    expect(ret.direction).toBeDefined();

  });
});

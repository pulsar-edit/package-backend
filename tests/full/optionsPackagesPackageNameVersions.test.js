const supertest = require("supertest");
const app = require("../../src/setupEndpoints.js");

describe("OPTIONS /api/packages/:packageName/versions", () => {
  test("Returns correct headers", async () => {
    const res = await supertest(app)
      .options("/api/packages/language-css/versions");

    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("POST");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    expect(res.headers["x-ratelimit-limit"]).toBeDefined();
    expect(res.headers["x-ratelimit-remaining"]).toBeDefined();
    expect(res.headers["x-ratelimit-reset"]).toBeDefined();
    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
    expect(res.headers["ratelimit-reset"]).toBeDefined();
  });
});

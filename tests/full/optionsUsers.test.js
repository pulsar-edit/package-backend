const supertest = require("supertest");
const app = require("../../src/setupEndpoints.js");

describe("OPTIONS /api/users", () => {
  test("Returns correct headers", async () => {
    const res = await supertest(app).options("/api/users");

    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["access-control-allow-methods"]).toEqual("GET");
    expect(res.headers["access-control-allow-headers"]).toEqual(
      "Content-Type, Authorization, Access-Control-Allow-Credentials"
    );
    expect(res.headers["access-control-allow-origin"]).toEqual(
      "https://packages.pulsar-edit.dev"
    );
    expect(res.headers["access-control-allow-credentials"]).toEqual("true");
    //expect(res.headers["x-content-type-options"]).toEqual("nosniff"); TODO
    expect(res.headers["x-ratelimit-limit"]).toBeDefined();
    expect(res.headers["x-ratelimit-remaining"]).toBeDefined();
    expect(res.headers["x-ratelimit-reset"]).toBeDefined();
    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
    expect(res.headers["ratelimit-reset"]).toBeDefined();
  });
});

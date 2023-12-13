const endpoint = require("../../src/controllers/getUpdates.js");
const context = require("../../src/context.js");

describe("Behaves as expected", () => {
  test("Returns properly", async () => {
    const sso = await endpoint.logic({}, context);

    expect(sso.ok).toBe(false);
    expect(sso.short).toBe("not_supported");
  });
});

describe("HTTP Handling works", () => {
  test("Calls the right function", async () => {
    const request = require("supertest");
    const app = require("../../src/setupEndpoints.js");

    const spy = jest.spyOn(endpoint, "logic");

    const res = await request(app).get("/api/updates");

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });
});

const endpoint = require("../../src/controllers/getRoot.js");
const context = require("../../src/context.js");

describe("Behaves as expected", () => {
  test("Should respond with an HTML document", async () => {
    const sso = await endpoint.logic({}, context);

    expect(sso.ok).toBe(true);
    expect(sso.content).toEqual(
      expect.stringContaining("Server is up and running Version")
    );
  });
});

describe("HTTP Handling works", () => {
  test("Calls the right function", async () => {
    const request = require("supertest");
    const app = require("../../src/setupEndpoints.js");

    const spy = jest.spyOn(endpoint, "logic");

    const res = await request(app).get("/");

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });
});

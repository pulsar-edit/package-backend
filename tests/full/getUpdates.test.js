const supertest = require("supertest");
const app = require("../../src/setupEndpoints.js");

describe("GET /api/updates", () => {
  test("Properly returns that it's not supported", async () => {
    const res = await supertest(app).get("/api/updates");

    expect(res).toHaveHTTPCode(501);
    expect(res.body.message).toBe("While under development this feature is not supported.");
  });
});

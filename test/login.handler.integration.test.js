const request = require("supertest");
const app = require("../src/main.js");

describe("Get /api/login", () => {
  test("Returns proper Status Code", async () => {
    const res = await request(app).get("/api/login");
    expect(res).toHaveHTTPCode(302);
  });
  // As for testing the rest of the behavior is near impossible.
  // Since it relies so heavily on GitHub.
});

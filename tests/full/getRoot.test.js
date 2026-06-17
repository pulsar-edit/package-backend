const supertest = require("supertest");
const app = require("../../src/setupEndpoints.js");

describe("GET /", () => {
  test("Successfully returns an HTML document", async () => {
    const res = await supertest(app).get("/");

    expect(res).toHaveHTTPCode(200);
    expect(res.text).toEqual(
      expect.stringContaining("Server is up and running")
    );
  });
});

const request = require("supertest");
const app = require("../../src/setupEndpoints.js");

describe("Get /", () => {
  test("Should respond with an HTML document noting the server version", async () => {
    const res = await request(app)
      .get("/")
      .expect("Content-Type", "text/html; charset=utf-8");

    expect(res.text).toEqual(
      expect.stringContaining("Server is up and running Version")
    );
  });
  test("Should Return valid status code", async () => {
    const res = await request(app).get("/");
    expect(res).toHaveHTTPCode(200);
  });
  test("Should 404 on invalid method", async () => {
    const res = await request(app).patch("/");
    expect(res).toHaveHTTPCode(404);
  });
});

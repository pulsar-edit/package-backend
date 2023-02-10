const request = require("supertest");
const app = require("../src/main.js");

describe("GET /api/stars", () => {
  test("Returns Unauthenticated Status Code for Invalid User", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Unauthenticated JSON for Invalid User", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Valid User with No Stars Returns array", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "no-star-token");
    expect(res.body).toBeArray();
  });
  test("Valid User with No Stars Returns Empty Array", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "no-star-token");
    expect(res.body.length).toEqual(0);
  });
  test("Valid User with No Stars Returns 200 Status Code", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "no-star-token");
    expect(res).toHaveHTTPCode(200);
  });
  test("Valid User with Stars Returns 200 Status Code", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "all-star-token");
    expect(res).toHaveHTTPCode(200);
  });
  test("Valid User with Stars Returns Array", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "all-star-token");
    expect(res.body).toBeArray();
  });
  test("Valid User with Stars Returns Non-Empty Array", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "all-star-token");
    expect(res.body.length).toBeGreaterThan(0);
  });
});

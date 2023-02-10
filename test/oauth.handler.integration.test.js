const request = require("supertest");
const app = require("../src/main.js");

describe("Get /api/oauth", () => {
  test("Returns Not Found Status Code when provided no State", async () => {
    const res = await request(app).get("/api/oauth");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message when provided no State", async () => {
    const res = await request(app).get("/api/oauth");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test.todo(
    "Can we test? This section has been tested manually. But beyond that seems impossible to truly test."
  );
});

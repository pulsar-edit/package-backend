const request = require("supertest");
const app = require("../src/main.js");

describe("GET /api/updates", () => {
  test.todo("/api/updates currentlty returns Not Supported.");
  test("Returns NotSupported Status Code.", async () => {
    const res = await request(app).get("/api/updates");
    expect(res).toHaveHTTPCode(501);
  });
  test("Returns NotSupported Message", async () => {
    const res = await request(app).get("/api/updates");
    expect(res.body.message).toEqual(msg.notSupported);
  });
});

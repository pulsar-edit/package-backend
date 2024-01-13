const request = require("supertest");
const app = require("../../src/setupEndpoints.js");

const { authMock } = require("../helpers/httpMock.helper.jest.js");

let tmpMock;

describe("GET /api/stars", () => {
  test("Returns Unauthenticated Status Code for Invalid User", async () => {
    tmpMock = authMock({
      ok: false,
      short: "unauthorized",
      content: "Bad Auth Mock Return for Dev User",
    });

    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(
      "Unauthorized: Please update your token if you haven't done so recently."
    );

    tmpMock.mockClear();
  });

  test("Valid User with No Stars Returns array", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "no-star-token",
        id: 342342,
        node_id: "no-star-test-user",
        username: "no-star-test-user-node-id",
        avatar: "https://domain.org",
      },
    });

    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "no-star-token");
    expect(res.body).toBeArray();
    expect(res.body.length).toEqual(0);
    expect(res).toHaveHTTPCode(200);

    tmpMock.mockClear();
  });

  test.skip("Valid User with Stars Returns 200 Status Code", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "all-star-token",
        id: 2222,
        node_id: "many-star-user-node-id",
        username: "many-star-user",
        avatar: "https://domain.org",
      },
    });

    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "all-star-token");
    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBeGreaterThan(0);

    tmpMock.mockClear();
  });
});

const request = require("supertest");
const app = require("../src/main.js");

const auth = require("../src/auth.js");

const authMock = (data) => {
  const internalMock = jest
    .spyOn(auth, "verifyAuth")
    .mockImplementationOnce((token) => {
      return data;
    });
  return internalMock;
};

let tmpMock;

describe("GET /api/users/:login/stars", () => {
  test("Returns 404 for Bad User", async () => {
    const res = await request(app).get("/api/users/not-a-user/stars");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found for Bad User", async () => {
    const res = await request(app).get("/api/users/not-a-user/stars");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns an Array for Valid User with Stars", async () => {
    const res = await request(app).get("/api/users/has-all-stars/stars");
    expect(res.body).toBeArray();
  });
  test("Returns an Array for Valid User without Stars", async () => {
    const res = await request(app).get("/api/users/has-no-stars/stars");
    expect(res.body).toBeArray();
  });
  test("Returns an Empty Array for Valid User without Stars", async () => {
    const res = await request(app).get("/api/users/has-no-stars/stars");
    expect(res.body.length).toEqual(0);
  });
});

describe("GET /api/users", () => {
  test("Returns Unauthenticated Status Code for No Creds", async () => {
    const res = await request(app).get("/api/users");
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);
  });

  test("Returns Unauthenticated Status Code & Message for Bad Creds", async () => {
    tmpMock = authMock({
      ok: false,
      short: "Bad Auth",
      content: "Bad Auth Mock Return for Dev user",
    });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);

    tmpMock.mockClear();
  });
  test("Returns User Data and Proper Status Code for Good Creds", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "valid-token",
        id: 342342,
        node_id: "generic-user-account-node-id",
        username: "generic-user-account",
        avatar: "https://domain.org",
        created_at: "",
        data: {},
        packages: [],
      },
    });
    // TODO Might have to rethink this one.

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(200);
    expect(res.body.username).toEqual("generic-user-account");
    expect(res.body.avatar).toEqual("https://domain.org");
    expect(res.body.created_at).toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.node_id).toEqual("generic-user-account-node-id");
    expect(res.body.token).toEqual("valid-token");
    expect(res.body.packages).toBeDefined();
    expect(res.body.packages).toBeArray();

    tmpMock.mockClear();
  });
});

describe("GET /api/users/:login", () => {
  test("Returns 404 && Not Found Message for bad user", async () => {
    const res = await request(app).get("/api/users/not-a-user");
    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns User Object for Valid User", async () => {
    const res = await request(app).get("/api/users/dever");
    expect(res).toHaveHTTPCode(200);
    expect(res.body.username).toEqual("dever");
    expect(res.body.avatar).toEqual("https://roadtonowhere.com");
    expect(res.body.created_at).toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.packages).toBeDefined();
    expect(res.body.packages).toBeArray();
  });
  test("Returns No Senstive Data for Valid User", async () => {
    const res = await request(app).get("/api/users/dever");
    expect(res).toHaveHTTPCode(200);
    expect(res.body.token === undefined).toBeTruthy();
    expect(res.body.id === undefined).toBeTruthy();
    expect(res.body.node_id === undefined).toBeTruthy();
  });
});

const request = require("supertest");
const app = require("../src/main.js");

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
  });
  test("Returns Unauthenticated Message for No Creds", async () => {
    const res = await request(app).get("/api/users");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns Unauthenticated Status Code & Message for Bad Creds", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns User Data and Proper Status Code for Good Creds", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(200);
    expect(res.body.username).toEqual("dever");
    expect(res.body.avatar).toEqual("https://roadtonowhere.com");
    expect(res.body.created_at).toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.node_id).toEqual("dever-nodeid");
    expect(res.body.token).toEqual("valid-token");
    expect(res.body.packages).toBeDefined();
    expect(res.body.packages).toBeArray();
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

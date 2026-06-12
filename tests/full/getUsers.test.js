const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");

describe("GET /api/users", () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect("127.0.0.1");
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test("Fails when bad auth is provided", async () => {
    // Return bad auth from github
    nock("https://api.github.com/").get("/user").reply(401, {
      message: "Requires authentication"
    });

    const res = await supertest(app)
      .get("/api/users")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test("Successfully returns a user", async () => {
    // Add the dev user to the db
    const addUser = await database.insertNewUser(
      "get-user-node-id",
      "get-user-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    // Return good auth from github
    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "get-user-node-id"
    });

    const res = await supertest(app)
      .get("/api/users")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(200);
    expect(res.body.node_id).toBe("get-user-node-id");

    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });

  test("Properly assigns HTTP Headers as needed", async () => {
    const res = await supertest(app).get("/api/users");

    expect(res.headers["access-control-allow-methods"]).toBe("GET");
    expect(res.headers["access-control-allow-headers"]).toBe("Content-Type, Authorization, Access-Control-Allow-Credentials");
    expect(res.headers["access-control-allow-origin"]).toBe("https://packages.pulsar-edit.dev");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });
});

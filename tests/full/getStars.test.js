const request = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/stars", () => {
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

  test("Returns Unauthenticated Status Code for Invalid User", async () => {
    nock("https://api.github.com/").get("/user").reply(401, {
      message: "Requires authentication"
    });

    const res = await request(app).get("/api/stars").set({ Authorization: "invalid" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(
      "Unauthorized: Please update your token if you haven't done so recently."
    );
  });

  test("Valid User with No Stars Returns array", async () => {
    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "getStars-test-node-id"
    });

    const addUser = await database.insertNewUser(
      "getStars-test-node-id",
      "getStars-test-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    const res = await request(app).get("/api/stars")
      .set({ Authorization: "any-token-will-do" });
    expect(res.body).toBeArray();
    expect(res.body.length).toEqual(0);
    expect(res).toHaveHTTPCode(200);

    // cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });

  test.skip("Valid User with Stars Returns 200 Status Code", async () => {
    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "getStars-test-node-id"
    });

    const addUser = await database.insertNewUser(
      "getStars-test-node-id",
      "getStars-test-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/get-stars-test")
    );
    expect(addPkg.ok).toBe(true);

    const starPkg = await request(app)
      .post("/api/packages/get-stars-test/star")
      .set({ Authorization: "any-token-will-do" });
    expect(starPkg).toHaveHTTPCode(200);

    const res = await request(app).get("/api/stars").set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBeGreaterThan(0);

    // cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);

    const removePkg = await database.removePackageByName("get-stars-test", true);
    expect(removePkg.ok).toBe(true);
  });
});

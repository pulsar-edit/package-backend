const supertest = require("supertest");
const nock = require("nock");
let app = require("../../src/app.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/stars", () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect();
    app = app.listen(8080);
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
    app.close();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test("Returns Unauthenticated Status Code for Invalid User", async () => {
    // == Setup
    nock("https://api.github.com/").get("/user").reply(401, {
      message: "Requires authentication",
    });

    // == Test
    const res = await supertest(app)
      .get("/api/stars")
      .set({ Authorization: "invalid" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(
      "Unauthorized: Please update your token if you haven't done so recently."
    );
  });

  test("Valid user with no Stars return array", async () => {
    // == Setup
    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "getStars-test-node-id",
    });

    const addUser = await database.insertNewUser(
      "getStars-test-node-id",
      "getStars-test-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    // == Test
    const res = await supertest(app)
      .get("/api/stars")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toEqual(0);

    // == Cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });

  test("Valid user with Stars returns starred packages", async () => {
    // == Setup
    // We mock this return twice, 1 for starring the pack, and 2 for checking our stars
    nock("https://api.github.com/").get("/user").times(2).reply(200, {
      node_id: "getStars-test-node-id",
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

    const starPkg = await supertest(app)
      .post("/api/packages/get-stars-test/star")
      .set({ Authorization: "any-token-will-do" });
    expect(starPkg).toHaveHTTPCode(200);

    // == Test
    const res = await supertest(app)
      .get("/api/stars")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("get-stars-test");

    // == Cleanup
    const removeStar = await database.updateDecrementStar(
      addUser.content,
      "get-stars-test"
    );
    expect(removeStar.ok).toBe(true);

    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);

    const removePkg = await database.removePackageByName(
      "get-stars-test",
      true
    );
    expect(removePkg.ok).toBe(true);
  });
});

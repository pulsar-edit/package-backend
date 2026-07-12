const supertest = require("supertest");
const nock = require("nock");
let app = require("../../src/app.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("POST /api/packages/:packageName/star", () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect("127.0.0.1");
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

  test("Fails when bad auth is provided", async () => {
    // == Setup
    nock("https://api.github.com/").get("/user").reply(401, {
      message: "Requires authentication",
    });

    // == Test
    const res = await supertest(app)
      .post("/api/packages/any-package-name-will-do/star")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test("Fails when the package doesn't exist", async () => {
    // == Setup
    const addUser = await database.insertNewUser(
      "postPackagesStar-node-id",
      "postPackagesStar-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "postPackagesStar-node-id",
    });

    // == Test
    const res = await supertest(app)
      .post("/api/packages/this-package-doesn't-exist/star")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toBe("Not Found");

    // == Cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });

  test("On Success: Returns package and updates star count", async () => {
    // == Setup
    const addUser = await database.insertNewUser(
      "postPackagesStar-node-id",
      "postPackagesStar-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/star-pkg-test")
    );
    expect(addPkg.ok).toBe(true);

    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "postPackagesStar-node-id",
    });

    // == Test
    const res = await supertest(app)
      .post("/api/packages/star-pkg-test/star")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(200);
    expect(res.body.name).toBe("star-pkg-test");
    expect(res.body.stargazers_count).toBe("1");

    // == Cleanup
    const removePkg = await database.removePackageByName("star-pkg-test", true);
    expect(removePkg.ok).toBe(true);

    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });
});

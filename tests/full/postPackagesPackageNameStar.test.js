const supertest = require("supertest");
const nock = require("nock");
const genPackage = require("../helpers/package.jest.js");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");

describe("POST /api/packages/:packageName/star", () => {
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

  test("Fails with bad/no auth", async () => {
    // Return bad auth from github
    nock("https://api.github.com/").get("/user").reply(401, {
      message: "Requires authentication"
    });

    const res = await supertest(app)
      .post("/api/packages/any-package-name-will-do/star")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test("Fails when package doesn't exist", async () => {
    // Add dev user
    const addUser = await database.insertNewUser(
      "postPackagesPackageNameStar-node-id",
      "postPackagesPackageNameStar-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    // Return good auth from github
    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "postPackagesPackageNameStar-node-id"
    });

    const res = await supertest(app)
      .post("/api/packages/this-package-doesn't-exist/star")
      .set({ Authorization: "valid-token" });

    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toBe("Not Found");

    // Cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });

  test("Returns package and updates star count on success", async () => {
    // add the dev package to the db
    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/post-pkg-star-by-name-test")
    );
    expect(addPkg.ok).toBe(true);

    // Add dev user to the db
    const addUser = await database.insertNewUser(
      "post-pkg-star-by-name-test-node-id",
      "post-pkg-star-by-name-test-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    // Return good auth from github
    nock("https://api.github.com/").get("/user").times(2).reply(200, {
      node_id: "post-pkg-star-by-name-test-node-id"
    });

    const res = await supertest(app)
      .post("/api/packages/post-pkg-star-by-name-test/star")
      .set({ Authorization: "valid-token" });

    expect(res).toHaveHTTPCode(200);
    expect(res.body.name).toBe("post-pkg-star-by-name-test");
    expect(res.body.stargazers_count).toBe("1");

    // Cleanup
    // But we first must remove the user's star to delete them
    const removeStar = await supertest(app)
      .delete("/api/packages/post-pkg-star-by-name-test/star")
      .set({ Authorization: "valid-token" });
    expect(removeStar).toHaveHTTPCode(200);

    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);

    const removePkg = await database.removePackageByName("post-pkg-star-by-name-test");
    expect(removePkg.ok).toBe(true);
  });
});

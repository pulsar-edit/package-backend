const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("DELETE /api/packages/:packageName/versions/:versionName", () => {
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
    // == Setup
    // Return bad auth from GitHub
    nock("https://api.github.com").get("/user").reply(401, {
      message: "Requires authentication",
    });

    // == Test
    const res = await supertest(app)
      .delete("/api/packages/any-package-name-will-do/versions/1.0.0")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test("Fails with not found for non-existant package", async () => {
    // == Setup
    // Add the dev user to the db
    const addUser = await database.insertNewUser(
      "deletePackagesPackageNameVersionsVersionName-node-id",
      "deletePackagesPackageNameVersionsVersionName-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    // Return good auth from github
    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "deletePackagesPackageNameVersionsVersionName-node-id",
    });

    // == Test
    const res = await supertest(app)
      .delete("/api/packages/this-package-doesn't-exist/versions/1.0.0")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toBe("Not Found");

    // == Cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });

  test("Successfully deletes a package version", async () => {
    // == Setup
    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/dlt-pkg-ver-test", {
        versions: ["1.0.1", "1.0.0", "0.0.1"],
      })
    );
    expect(addPkg.ok).toBe(true);

    const addUser = await database.insertNewUser(
      "deletePackagesPackageNameVersionsVersionName-node-id",
      "deletePackagesPackageNameVersionsVersionName-node-id",
      "https:/roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    nock("https://api.github.com").get("/user").reply(200, {
      node_id: "deletePackagesPackageNameVersionsVersionName-node-id",
    });

    // Ensure user has ownership of repo
    nock("https://api.github.com")
      .get("/repos/confused-Techie/dlt-pkg-ver-test/collaborators?page=1")
      .reply(200, [
        {
          node_id: "deletePackagesPackageNameVersionsVersionName-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true,
          },
          role_name: "Admin",
        },
      ]);

    // == Test
    const res = await supertest(app)
      .delete("/api/packages/dlt-pkg-ver-test/versions/1.0.0")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(204);
    expect(res.body).toBeTypeof("object");
    expect(Object.keys(res.body).length).toBe(0);

    const doesPackageStillExist = await supertest(app).get(
      "/api/packages/dlt-pkg-ver-test"
    );

    expect(doesPackageStillExist).toHaveHTTPCode(200);
    expect(doesPackageStillExist.body.releases.latest).toBe("1.0.1");
    expect(doesPackageStillExist.body.versions["1.0.1"]).toBeDefined();
    expect(doesPackageStillExist.body.versions["1.0.0"]).toBeFalsy();
    expect(doesPackageStillExist.body.versions["0.0.1"]).toBeDefined();

    // == Cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);

    const removePkg = await database.removePackageByName(
      "dlt-pkg-ver-test",
      true
    );
    expect(removePkg.ok).toBe(true);
  });
});

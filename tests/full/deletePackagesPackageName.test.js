const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("DELETE /api/packages/:packageName", () => {
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
      .delete("/api/packages/any-package-name-will-do")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toBe("Unauthorized: Please update your token if you haven't done so recently.");
  });

  test("Fails when a bad package name is provided", async () => {
    // Return good auth from github
    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "deletePackagesPackageName-node-id"
    });

    const res = await supertest(app)
      .delete("/api/packages/this-package-doesn't-exist")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toBe("Not Found");
  });

  test("Successfully deletes a package", async () => {
    // Add the dev package to the db
    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/dlt-pkg-by-name-test")
    );
    expect(addPkg.ok).toBe(true);

    // Add the dev user to the db
    const addUser = await database.insertNewUser(
      "dlt-pkg-test-user-node-id",
      "dlt-pkg-test-user-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    // Return good auth from github
    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "dlt-pkg-test-user-node-id"
    });

    // Ensure user has ownership of the repo
    nock("https://api.github.com/")
      .get("/repos/confused-Techie/dlt-pkg-by-name-test/collaborators?page=1")
      .reply(200, [
        {
          node_id: "dlt-pkg-test-user-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true,
          },
          role_name: "Admin"
        }
      ]);

      const res = await supertest(app)
        .delete("/api/packages/dlt-pkg-by-name-test")
        .set({ Authorization: "any-token-will-do" });

      expect(res).toHaveHTTPCode(201);
      expect(res.body).toBe(null);

      const doesPackageStillExist = await supertest(app)
        .get("/api/packages/dlt-pkg-by-name-test");

      expect(doesPackageStillExist).toHaveHTTPCode(404);

      const isPackageNameAvailable = await database.packageNameAvailability(
        "dlt-pkg-by-name-test"
      );

      expect(isPackageNameAvailable.ok).toBe(false);
      expect(isPackageNameAvailable.short).toBe("not_found");
      expect(isPackageNameAvailable.content).toBe("dlt-pkg-by-name-test is not available to be used for a new package");
  });
});

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
    // === Setup
    // Return bad auth from github
    nock("https://api.github.com/").get("/user").reply(401, {
      message: "Requires authentication"
    });

    // == Test
    const res = await supertest(app)
      .delete("/api/packages/any-package-name-will-do")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toBe("Unauthorized: Please update your token if you haven't done so recently.");
  });

  test("Fails when a bad package name is provided", async () => {
    // == Setup
    // Add the dev user to the db
    const addUser = await database.insertNewUser(
      "deletePackagesPackageName-node-id",
      "deletePackagesPackageName-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    // Return good auth from github
    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "deletePackagesPackageName-node-id"
    });

    // == Test
    const res = await supertest(app)
      .delete("/api/packages/this-package-doesn't-exist")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toBe("Not Found");

    // == Cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });

  test("Fails when the user doesn't own the repo", async () => {
    // == Setup
    // Add dev package to db
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

    // Ensure user has ownership of repo
    nock("https://api.github.com/")
      .get("/repos/confused-Techie/dlt-pkg-by-name-test/collaborators?page=1")
      .reply(200, [
        {
          node_id: "NOT-dlt-pkg-test-user-node-id-NOPE",
          permissions: {
            admin: true,
            maintain: true,
            push: true
          },
          role_name: "Admin"
        }
      ]);

    // == Test
    const res = await supertest(app)
      .delete("/api/packages/dlt-pkg-by-name-test")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(500);
    expect(res.body.message).toBe("Server Error: From Server Error"); // TODO HUMANIZE

    const doesPackageStillExist = await supertest(app)
      .get("/api/packages/dlt-pkg-by-name-test");

    expect(doesPackageStillExist).toHaveHTTPCode(200);

    // == Cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);

    const removePkg = await database.removePackageByName("dlt-pkg-by-name-test", true);
    expect(removePkg.ok).toBe(true);
  });

  test("Successfully deletes a package", async () => {
    // == Setup
    // Add dev package to db
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

    // Ensure user has ownership of repo
    nock("https://api.github.com/")
      .get("/repos/confused-Techie/dlt-pkg-by-name-test/collaborators?page=1")
      .reply(200, [
        {
          node_id: "dlt-pkg-test-user-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true
          },
          role_name: "Admin"
        }
      ]);

    // == Test
    const res = await supertest(app)
      .delete("/api/packages/dlt-pkg-by-name-test")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(204);
    expect(res.body).toBeTypeof("object");
    expect(Object.keys(res.body).length).toBe(0);

    const doesPackageStillExist = await supertest(app)
      .get("/api/packages/dlt-pkg-by-name-test");

    expect(doesPackageStillExist).toHaveHTTPCode(404);

    const isPackageNameAvailable = await database.packageNameAvailability("dlt-pkg-by-name-test");

    expect(isPackageNameAvailable.ok).toBe(false);
    expect(isPackageNameAvailable.short).toBe("not_found");
    expect(isPackageNameAvailable.content).toBe("dlt-pkg-by-name-test is not available to be used for a new package.");

    // == Cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);

    const removePkg = await database.removePackageByName("dlt-pkg-by-name-test", true);
    expect(removePkg.ok).toBe(true);
  });
});

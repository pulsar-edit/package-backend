const supertest = require("supertest");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/packages/:packageName", () => {
  test("Fails when a package doesn't exist", async () => {
    const res = await supertest(app).get(
      "/api/packages/i-dont-exist-nor-should-i-ever"
    );

    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toBe("Not Found");
  });

  test("Returns a user published package", async () => {
    // == Setup
    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/get-package-test")
    );
    expect(addPkg.ok).toBe(true);

    // == Test
    const res = await supertest(app).get("/api/packages/get-package-test");

    expect(res).toHaveHTTPCode(200);
    expect(res.body.name).toBe("get-package-test");

    // == Cleanup
    const removePkg = await database.removePackageByName("get-package-test");
    expect(removePkg.ok).toBe(true);
  });

  test("Returns bundled package without it being in the database", async () => {
    const res = await supertest(app).get("/api/packages/settings-view");

    expect(res).toHaveHTTPCode(200);
    expect(res.body.name).toBe("settings-view");
    expect(res.body.owner).toBe("pulsar-edit");
    expect(res.body.repository.url).toBe(
      "https://github.com/pulsar-edit/pulsar"
    );
  });
});

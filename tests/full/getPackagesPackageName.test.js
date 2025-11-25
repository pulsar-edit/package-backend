const supertest = require("supertest");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("Behaves as expected", () => {
  test("Returns 404 when a package doesn't exist", async () => {
    const res = await supertest(app).get("/api/packages/anything");

    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toBe("Not Found");
  });

  test("Returns a package on success", async () => {
    await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/get-package-test", {
        versions: [ "1.1.0", "1.0.0" ]
      })
    );

    const res = await supertest(app).get("/api/packages/get-package-test");

    expect(res).toHaveHTTPCode(200);
    expect(res.body.name).toBe("get-package-test");
    expect(res.body.owner).toBe("confused-Techie");

    await database.removePackageByName("get-package-test", true);
  });

  test("Returns a bundled package without it existing in the database", async () => {
    const res = await supertest(app).get("/api/packages/settings-view");

    expect(res).toHaveHTTPCode(200);
    expect(res.body.name).toBe("settings-view");
    expect(res.body.owner).toBe("pulsar-edit");
    expect(res.body.repository.url).toBe("https://github.com/pulsar-edit/pulsar");
  });

  test("Adheres to `Server-Timing` Specification", async () => {
    const res = await supertest(app).get("/api/packages/i-dont-exist");
    
    expect(res.headers["server-timing"]).toBeTypeof("string");
  });
});

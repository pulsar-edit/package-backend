const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/packages/:packageName/availability", () => {
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

  test("Informs of an available name", async () => {
    // == Test
    const res = await supertest(app).get(
      "/api/packages/a-package-name-that-will-likely-never-be-taken-ever-ever/availability"
    );

    expect(res).toHaveHTTPCode(204);
    expect(Object.keys(res.body).length).toBe(0);
  });

  test("Informs of a banned name", async () => {
    // == Test
    const res = await supertest(app).get(
      "/api/packages/test-package/availability"
    );

    expect(res).toHaveHTTPCode(409);
    expect(res.body.message).toBe("A Package by that name already exists.");
  });

  test("Informs of a bundled name", async () => {
    // == Test
    const res = await supertest(app).get(
      "/api/packages/autocomplete-plus/availability"
    );

    expect(res).toHaveHTTPCode(409);
    expect(res.body.message).toBe("A Package by that name already exists.");
  });

  test("Informs of a taken name by a community package", async () => {
    // == Setup
    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/my-awesome-package")
    );
    expect(addPkg.ok).toBe(true);

    // == Test
    const res = await supertest(app).get(
      "/api/packages/my-awesome-package/availability"
    );

    expect(res).toHaveHTTPCode(409);
    expect(res.body.message).toBe("A Package by that name already exists.");

    // == Cleanup
    const removePkg = await database.removePackageByName(
      "my-awesome-package",
      true
    );
    expect(removePkg.ok).toBe(true);
  });
});

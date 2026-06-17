const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/owners/:ownerName", () => {
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

  test("Returns an empty result if the owner doesn't exist", async () => {
    // == Setup
    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/pulsar-cooperative/get-owner-test")
    );
    expect(addPkg.ok).toBe(true);

    // == Test
    const res = await supertest(app).get("/api/owners/i-dont-exist");

    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBe(0);

    // == Cleanup
    const removePkg = await database.removePackageByName(
      "get-owner-test",
      true
    );
    expect(removePkg.ok).toBe(true);
  });

  test("Returns a package owned by the owner", async () => {
    // == Setup
    // add dev package
    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/pulsar-cooperative/get-owner-test")
    );
    expect(addPkg.ok).toBe(true);

    // == Test
    const res = await supertest(app).get("/api/owners/pulsar-cooperative");

    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("get-owner-test");

    // == Cleanup
    const removePkg = await database.removePackageByName(
      "get-owner-test",
      true
    );
    expect(removePkg.ok).toBe(true);
  });
});

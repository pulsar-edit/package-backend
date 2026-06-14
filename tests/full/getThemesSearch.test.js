const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/themes/search", () => {
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

  test("Returns empty array when no packages match the search", async () => {
    const res = await supertest(app)
      .get("/api/themes/search")
      .query({ q: "hello-world" });

    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBe(0);
  });

  test("Returns array with packages on success", async () => {
    // == Setup
    const addPkg1 = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/atom-material-syntax", {
        extraVersionData: {
          theme: "ui"
        }
      })
    );
    expect(addPkg1.ok).toBe(true);

    const addPkg2 = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/atom-material-themeless")
    );
    expect(addPkg2.ok).toBe(true);

    // == Test
    const res = await supertest(app)
      .get("/api/themes/search")
      .query({ q: "atom-material"});

    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("atom-material-syntax");

    // == Cleanup
    const removePkg1 = await database.removePackageByName("atom-material-syntax", true);
    expect(removePkg1.ok).toBe(true);

    const removePkg2 = await database.removePackageByName("atom-material-themeless", true);
    expect(removePkg2.ok).toBe(true);
  });
});

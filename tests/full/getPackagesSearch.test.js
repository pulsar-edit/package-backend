const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/packages/search", () => {
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

  describe("Allows filtering of parameters", () => {
    beforeAll(async () => {
      const addPkg1 = await database.insertNewPackage(
        genPackage(
          "https://github.com/getPackagesSearch/get-packages-search-theme-test",
          {
            extraVersionData: {
              theme: "syntax",
            },
            creation_method: "User Made Package" // Pulsar package
          }
        )
      );
      expect(addPkg1.ok).toBe(true);

      const addPkg2 = await database.insertNewPackage(
        genPackage(
          "https://github.com/getPackagesSearch/get-packages-search-test",
          {
            creation_method: "Migrated from Atom.io" // Atom package
          }
        )
      );
      expect(addPkg2.ok).toBe(true);

      const addFeatures = await database.applyFeatures(
        {
          hasSnippets: false,
          hasGrammar: false,
          supportedLanguages: ["js", "ts"],
        },
        "get-packages-search-test",
        "1.0.0"
      );
      expect(addFeatures.ok).toBe(true);
    });

    afterAll(async () => {
      const removePkg1 = await database.removePackageByName(
        "get-packages-search-theme-test",
        true
      );
      expect(removePkg1.ok).toBe(true);

      const removePkg2 = await database.removePackageByName(
        "get-packages-search-test",
        true
      );
      expect(removePkg2.ok).toBe(true);
    });

    test("By standard 'query' field", async () => {
      const res = await supertest(app)
        .get("/api/packages/search")
        .query({ q: "get packages search" });

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBe("get-packages-search-test");
      expect(res.body[1].name).toBe("get-packages-search-theme-test");
    });

    test("By 'query' & 'filter' field", async () => {
      const res = await supertest(app)
        .get("/api/packages/search")
        .query({ q: "get packages search" })
        .query({ filter: "theme" });

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("get-packages-search-theme-test");
    });

    test("By 'query' & 'fileExtension' field", async () => {
      const res = await supertest(app)
        .get("/api/packages/search")
        .query({ q: "get packages search" })
        .query({ fileExtension: "js" });

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("get-packages-search-test");
    });

    test("By 'query' & 'fileExtension' field: Exclude results all results", async () => {
      const res = await supertest(app)
        .get("/api/packages/search")
        .query({ q: "get package search" })
        .query({ fileExtension: "sql" });

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(0);
    });

    test("By 'creationMethod' field: Include Pulsar packages", async () => {
      const res = await supertest(app)
        .get("/api/packages/search")
        .query({ q: "get" })
        .query({ creationMethod: "pulsar" });

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("get-packages-search-theme-test");
    });

    test("By 'creationMethod' field: Include Atom packages", async () => {
      const res = await supertest(app)
        .get("/api/packages/search")
        .query({ q: "get" })
        .query({ creationMethod: "atom" });

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("get-packages-search-test");
    });

    test("By 'creationMethod' field: Include all packages", async () => {
      const res = await supertest(app)
        .get("/api/packages/search")
        .query({ q: "get" })
        .query({ creationMethod: "any" });

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(2);
    });
  });
});

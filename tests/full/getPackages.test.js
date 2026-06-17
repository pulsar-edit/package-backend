const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/packages", () => {
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

  describe("Allows Filtering of optional parameters", () => {
    beforeAll(async () => {
      const addPkg1 = await database.insertNewPackage(
        genPackage("https://github.com/unique_user/get-packages-test", {
          versions: ["1.1.0", "1.0.0"],
          extraVersionData: {
            providedServices: {
              refactor: {
                versions: { "0.0.1": "provideRefactor" },
              },
            },
          },
        })
      );
      expect(addPkg1.ok).toBe(true);

      const addPkg2 = await database.insertNewPackage(
        genPackage("https://github.com/savetheclocktower/calculator-light-ui", {
          versions: ["9.0.0"],
          extraVersionData: {
            providedServices: {
              another: {
                versions: { "0.1.1": "provideanother" },
              },
            },
          },
        })
      );
      expect(addPkg2.ok).toBe(true);
    });

    afterAll(async () => {
      const removePkg1 = await database.removePackageByName(
        "get-packages-test",
        true
      );
      expect(removePkg1.ok).toBe(true);

      const removePkg2 = await database.removePackageByName(
        "calculator-light-ui",
        true
      );
      expect(removePkg2.ok).toBe(true);
    });

    test("By 'owner' field", async () => {
      const res = await supertest(app)
        .get("/api/packages")
        .query({ owner: "unique_user" });

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("get-packages-test");
      expect(res.body[0].owner).toBe("unique_user");
    });

    test("By 'service' field", async () => {
      const res = await supertest(app)
        .get("/api/packages")
        .query({ service: "refactor" })
        .query({ serviceType: "provided" });

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("get-packages-test");
      expect(res.body[0].owner).toBe("unique_user");
    });

    test("By 'owner' & 'service' field", async () => {
      const res = await supertest(app)
        .get("/api/packages")
        .query({ service: "refactor" })
        .query({ serviceType: "provided" })
        .query({ owner: "unique_user" });

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("get-packages-test");
      expect(res.body[0].owner).toBe("unique_user");
    });
  });
});

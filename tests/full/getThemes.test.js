const supertest = require("supertest");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/themes", () => {
  test("Returns empty array if no themes are present", async () => {
    const res = await supertest(app)
      .get("/api/themes");

    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBe(0);
  });

  describe("On success", () => {
    // Is this a better way to format tests? Rather than comments describing
    // Where the setup, test, and cleanup is?
    let addPkg, res;

    beforeAll(async () => {
      addPkg = await database.insertNewPackage(
        genPackage("https://github.com/confused-Techie/test-package", {
          versions: ["1.1.0", "1.0.0"],
          extraVersionData: {
            theme: "syntax"
          }
        })
      );
      expect(addPkg.ok).toBe(true);
    });

    test("Response contains packages", async () => {
      res = await supertest(app)
        .get("/api/themes");

      expect(res).toHaveHTTPCode(200);
      expect(res.body).toBeArray();
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("test-package");
    });

    test("Response contains proper headers", () => {
      expect(res.headers["link"]).toBeDefined();
      // With one response current page and last page should both be page 1
      // Default required parameters (sort, direction) should automatically be appended
      expect(res.headers["link"]).toMatch(
        /^<https:\/\/[a-z.-]+\/api\/themes\?page=1&sort=downloads&direction=desc>; rel="self",/
      );
      expect(res.headers["link"]).toMatch(
        /<https:\/\/[a-z.-]+\/api\/themes\?page=1&sort=downloads&direction=desc>; rel="last"$/
      );
    });

    afterAll(async () => {
      const removePkg = await database.removePackageByName("test-package", true);
      expect(removePkg.ok).toBe(true);
    });
  });
});

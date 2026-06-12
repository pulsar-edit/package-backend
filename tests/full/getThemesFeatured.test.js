const supertest = require("supertest");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/themes/featured", () => {
  test("Returns not found when no featured packages are present", async () => {
    const res = await supertest(app).get("/api/themes/featured");

    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toBe("Not Found");
  });

  test("Returns featured packages on success", async () => {
    const addPkg = await database.insertNewPackage(
      // We know 'atom-material-ui' is currently featured
      genPackage("https://github.com/confused-Techie/atom-material-ui", {
        extraVersionData: { theme: "ui" }
      })
    );
    expect(addPkg.ok).toBe(true);

    const res = await supertest(app).get("/api/themes/featured");

    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("atom-material-ui");

    // cleanup
    const removePkg = await database.removePackageByName("atom-material-ui", true);
    expect(removePkg.ok).toBe(true);
  });
});

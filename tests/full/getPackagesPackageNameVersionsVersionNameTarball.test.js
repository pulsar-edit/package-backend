const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");
const genPackage = require("../helpers/package.jest.js");

describe("GET /api/packages/:packageName/version/:versionName/tarball", () => {
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

  test("Returns valid GitHub Tarball Link", async () => {
    // == Setup
    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/dwnld-pkg-test", {
        tarballUrl: "https://api.github.com/repos/confused-Techie/dwnld-pkg-test/tarball/refs/tags/v1.0.0"
      })
    );
    expect(addPkg.ok).toBe(true);

    // == Test
    const res = await supertest(app)
      .get("/api/packages/dwnld-pkg-test/versions/1.0.0/tarball");

    expect(res).toHaveHTTPCode(302);
    expect(res.headers["location"]).toBe("https://api.github.com/repos/confused-Techie/dwnld-pkg-test/tarball/refs/tags/v1.0.0");

    // == Cleanup
    const removePkg = await database.removePackageByName("dwnld-pkg-test", true);
    expect(removePkg.ok).toBe(true);
  });

  test("Updates the download count of a package", async () => {
    // == Setup
    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/dwnld-pkg-update-test", {
        tarballUrl: "https://api.github.com/repos/confused-Techie/dwnld-pkg-update-test/tarball/refs/tags/v1.0.0"
      })
    );

    expect(addPkg.ok).toBe(true);

    // == Tests
    const pkgObj = await supertest(app)
      .get("/api/packages/dwnld-pkg-update-test");
    expect(pkgObj).toHaveHTTPCode(200);

    const downloadsOriginal = pkgObj.body.downloads;

    const res = await supertest(app)
      .get("/api/packages/dwnld-pkg-update-test/versions/1.0.0/tarball");

    expect(res).toHaveHTTPCode(302);

    const pkgObjNew = await supertest(app)
      .get("/api/packages/dwnld-pkg-update-test");
    expect(pkgObjNew).toHaveHTTPCode(200);
    const downloadsNew = pkgObjNew.body.downloads;

    expect(parseInt(downloadsNew)).toBe(parseInt(downloadsOriginal) + 1);

    // == Cleanup
    const removePkg = await database.removePackageByName("dwnld-pkg-update-test", true);
    expect(removePkg.ok).toBe(true);
  });

  test("Downloading a package doesn't modify the `updated` column", async () => {
    // == Setup
    const addPkg = await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/dwnld-pkg-count-test", {
        tarballUrl: "https://api.github.com/repos/confused-Techie/dwnld-pkg-count-test/tarball/refs/tags/v1.0.0"
      })
    );

    expect(addPkg.ok).toBe(true);

    // == Tests
    const pkgObj = await database.getPackageByName("dwnld-pkg-count-test");
    expect(pkgObj.ok).toBe(true);
    const updatedOriginal = pkgObj.content.updated;

    // Wait a second to ensure the time will be different
    await new Promise((r) => setTimeout(r, 2000));

    const res = await supertest(app)
      .get("/api/packages/dwnld-pkg-count-test/versions/1.0.0/tarball");

    expect(res).toHaveHTTPCode(302);

    const pkgObjNew = await database.getPackageByName("dwnld-pkg-count-test");
    expect(pkgObjNew.ok).toBe(true);
    const updatedNew = pkgObjNew.content.updated;

    expect(updatedOriginal).toEqual(updatedNew);

    // == Cleanup
    const removePkg = await database.removePackageByName("dwnld-pkg-count-test", true);
    expect(removePkg.ok).toBe(true);
  });
});

const endpoint = require("../../src/controllers/getPackagesSearch.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

describe("Behaves as expected", () => {
  beforeAll(async () => {
    await database.insertNewPackage({
      name: "get-packages-search-theme-test",
      repository: {
        url: "https://github.com/getPackagesSearch/get-packages-search-theme-test",
        type: "git",
      },
      owner: "getPackagesSearch",
      creation_method: "Test Package",
      releases: {
        latest: "1.0.0",
      },
      readme: "This is a readme!",
      metadata: {
        name: "get-packages-search-theme-test",
        theme: "syntax",
      },
      versions: {
        "1.0.0": {
          dist: {
            tarball: "download-url",
            sha: "1234",
          },
          name: "get-packages-search-theme-test",
        },
      },
    });

    await database.insertNewPackage({
      name: "get-packages-search-test",
      repository: {
        url: "https://github.com/getPackagesSearch/get-packages-search-test",
        type: "git",
      },
      owner: "getPackagesSearch",
      creation_method: "Test Package",
      releases: {
        latest: "1.0.0",
      },
      readme: "This is a readme!",
      metadata: {
        name: "get-packages-search-test",
      },
      versions: {
        "1.0.0": {
          dist: {
            tarball: "download-url",
            sha: "1234",
          },
          name: "get-packages-search-test",
        },
      },
    });
  });

  afterAll(async () => {
    await database.removePackageByName("get-packages-search-theme-test");
    await database.removePackageByName("get-packages-search-test");
  });

  test("Successfully searches", async () => {
    let sso = await endpoint.logic(
      {
        sort: "downloads",
        page: 1,
        direction: "desc",
        query: "get packages search",
        filter: "package",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content.length).toBe(2);
    expect(sso.content[0].name).toBe("get-packages-search-test");
    expect(sso.content[1].name).toBe("get-packages-search-theme-test");
    expect(sso).toMatchEndpointSuccessObject(endpoint);
  });

  test("Successfully searches and filters by theme", async () => {
    let sso = await endpoint.logic(
      {
        sort: "downloads",
        page: 1,
        direction: "desc",
        query: "get packages search",
        filter: "theme",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("get-packages-search-theme-test");
    expect(sso).toMatchEndpointSuccessObject(endpoint);
  });
});

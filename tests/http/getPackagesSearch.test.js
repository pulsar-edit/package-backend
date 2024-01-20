const endpoint = require("../../src/controllers/getPackagesSearch.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

const genPackage = require("../helpers/package.jest.js");

describe("Behaves as expected", () => {
  beforeAll(async () => {
    await database.insertNewPackage(
      genPackage(
        "https://github.com/getPackagesSearch/get-packages-search-theme-test",
        {
          extraVersionData: {
            theme: "syntax",
          },
        }
      )
    );

    await database.insertNewPackage(
      genPackage(
        "https://github.com/getPackagesSearch/get-packages-search-test"
      )
    );
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

  test("Successfully searches and filters by supported extensions", async () => {
    await database.applyFeatures(
      {
        hasSnippets: false,
        hasGrammar: true,
        supportedLanguages: ["js", "ts"],
      },
      "get-packages-search-test",
      "1.0.0"
    );

    let sso = await endpoint.logic(
      {
        sort: "downloads",
        page: 1,
        direction: "desc",
        query: "get packages search",
        filter: "package",
        fileExtension: "js",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("get-packages-search-test");
    expect(sso).toMatchEndpointSuccessObject(endpoint);

    // Now if we exclude the package via the supported file extensions
    let ssoEmpty = await endpoint.logic(
      {
        sort: "downloads",
        page: 1,
        direction: "desc",
        query: "get packages search",
        filter: "package",
        fileExtension: "sql",
      },
      context
    );

    expect(ssoEmpty.ok).toBe(true);
    expect(ssoEmpty.content.length).toBe(0);
  });
});

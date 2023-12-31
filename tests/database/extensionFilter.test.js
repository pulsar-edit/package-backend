const database = require("../../src/database.js");

afterAll(async () => {
  await database.shutdownSQL();
});

describe("Returns correct data when filtering by extension", () => {
  test("If given a nonexistant extension", async () => {
    const res = await database.getSortedPackages({
      page: 1,
      sort: "relevance",
      fileExtension: "this-does-not-exist",
    });

    expect(res.ok).toBeTruthy();
    expect(res.content.length).toBe(0);
  });

  test("If the file extension exists", async () => {
    // Add our test package
    const addPack = await database.insertNewPackage({
      name: "extensionfilter-returns",
      repository: {
        type: "git",
        url: "https://github.com/confused-Techie/extensionFilter-Returns",
      },
      owner: "confused-Techie",
      downloads: 0,
      stargazers_count: 0,
      creation_method: "Test run",
      releases: {
        latest: "1.0.0",
      },
      readme: "This file is a readme",
      metadata: {
        name: "extensionFilter-Returns",
        main: "./src/server.js",
        version: "1.0.0",
        description: "Something something",
        repository:
          "https://github.com/confused-Techie/extensionFilter-Returns",
        license: "MIT",
      },
      versions: {
        "1.0.0": {
          name: "extensionFilter-Returns",
          main: "./src/server.js",
          version: "1.0.0",
          description: "Something something",
          repository:
            "https://github.com/confused-Techie/extensionFilter-Returns",
          license: "MIT",
          tarball_url: "https://nowhere.com",
          sha: "12345",
        },
      },
    });

    if (!addPack.ok) console.log(addPack);
    expect(addPack.ok).toBeTruthy();

    const addFeature = await database.applyFeatures(
      {
        hasSnippets: false,
        hasGrammar: true,
        supportedLanguages: ["css"],
      },
      "extensionfilter-returns",
      "1.0.0"
    );

    if (!addFeature.ok) console.log(addFeature);
    expect(addFeature.ok).toBeTruthy();

    // Run our actual test
    const res = await database.getSortedPackages({
      page: 1,
      sort: "relevance",
      fileExtension: "this-does-not-exist",
    });

    // Cleanup our test package
    const clean = await database.removePackageByName(
      "extensionfilter-returns",
      true
    );
    if (!clean.ok) console.log(clean);
    expect(clean.ok).toBeTruthy();
  });
});

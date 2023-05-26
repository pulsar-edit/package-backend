const database = require("../../src/database.js");

afterAll(async () => {
  await database.shutdownSQL();
});

describe("Exits properly", () => {
  test("If given an invalid name", async () => {
    const res = await database.applyFeatures({}, "this-name-doesn't-exist", "1.0.0");

    expect(res.ok).toBeFalsy();
    expect(res.content).toBe("Unable to find the pointer of this-name-doesn't-exist");
    expect(res.short).toBe("Not Found");
  });
});

describe("Returns OK even if not making any changes", () => {
  beforeAll(async () => {
    // Add the package to test
    const addPack = await database.insertNewPackage({
      name: "applyfeatures-exitsproperly",
      repository: {
        type: "git",
        url: "https://github.com/confused-Techie/applyFeatures-ExitsProperly"
      },
      downloads: 0,
      stargazers_count: 0,
      creation_method: "Test Run",
      releases: {
        latest: "1.0.0"
      },
      readme: "This file is a readme",
      metadata: {
        name: "applyFeatures-ExitsProperly",
        main: "./src/server.js",
        version: "1.0.0",
        description: "Something something",
        repository: "https://github.com/confused-Techie/applyFeatures-ExitsProperly",
        license: "MIT"
      },
      versions: {
        "1.0.0": {
          name: "applyFeatures-ExitsProperly",
          main: "./src/server.js",
          version: "1.0.0",
          description: "Something someting",
          repository: "https://github.com/confused-Techie/applyFeatures-ExitsProperly",
          license: "MIT",
          tarball_url: "https://nowhere.com",
          sha: "12345"
        }
      }
    });

    if (!addPack.ok) console.log(addPack);
    expect(addPack.ok).toBeTruthy();
  });

  afterAll(async () => {
    // Now cleanup
    const clean = await database.removePackageByName("applyfeatures-exitsproperly", true);
    if (!clean.ok) console.log(clean);
    expect(clean.ok).toBeTruthy();
  });

  test("Returns OK even if not making any changes", async () => {
    const res = await database.applyFeatures(
      {
        hasSnippets: false,
        hasGrammar: false,
        supportedLanguages: []
      },
      "applyfeatures-exitsproperly", "1.0.0"
    );

    if (!res.ok) console.log(res);
    expect(res.ok).toBeTruthy();
  });
});

describe("Adds data properly for features", () => {
  beforeAll(async () => {
    // Setup the package to test
    const addPack = await database.insertNewPackage({
      name: "applyfeatures-proper",
      repository: {
        type: "git",
        url: "https://github.com/confused-Techie/applyFeatures-Proper"
      },
      downloads: 0,
      stargazers_count: 0,
      creation_method: "Test Run",
      releases: {
        latest: "1.0.0"
      },
      readme: "This file is a readme",
      metadata: {
        name: "applyFeatures-Proper",
        main: "./src/server.js",
        version: "1.0.0",
        description: "Something something",
        repository: "https://github.com/confused-Techie/applyFeatures-Proper",
        license: "MIT"
      },
      versions: {
        "1.0.0": {
          name: "applyFeatures-Proper",
          main: "./src/server.js",
          version: "1.0.0",
          description: "Something someting",
          repository: "https://github.com/confused-Techie/applyFeatures-Proper",
          license: "MIT",
          tarball_url: "https://nowhere.com",
          sha: "12345"
        }
      }
    });

    if (!addPack.ok) console.log(addPack);
    expect(addPack.ok).toBeTruthy();

  });

  afterAll(async () => {
    // Cleanup
    const clean = await database.removePackageByName("applyfeatures-proper", true);
    if (!clean.ok) console.log(clean);
    expect(clean.ok).toBeTruthy();
  });

  test("Adds data properly for features", async () => {
    const res = await database.applyFeatures(
      {
        hasSnippets: true,
        hasGrammar: true,
        supportedLanguages: [ "js", "ts" ]
      },
      "applyfeatures-proper", "1.0.0"
    );

    if (!res.ok) console.log(res);
    expect(res.ok).toBeTruthy();

    // Get package data to test if features are present
    const pack = await database.getPackageByName("applyfeatures-proper");
    expect(pack.ok).toBeTruthy();
    // Now to inspect the data returned
    expect(pack.content.versions[0].hasGrammar).toBeTruthy();
    expect(pack.content.versions[0].hasSnippets).toBeTruthy();
    expect(Array.isArray(pack.content.versions[0].supportedLanguages)).toBeTruthy();
    expect(pack.content.versions[0].supportedLanguages.length).toBeGreaterThan(0);
  });
});

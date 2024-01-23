const pof = require("../../../src/models/constructPackageObjectFull.js");
const schema = require("../../models/packageObjectFull.js").test;

describe("Parses Data, as expected to be returned by the Database", () => {

  test("Correctly Parses normal data", async () => {
    const data = {
      pointer: "1234",
      name: "test-package",
      created: "2024-01-20T00:47:00.981Z",
      updated: "2024-01-20T00:47:00.981Z",
      creation_method: "Test Package",
      downloads: "25",
      data: {
        name: "test-package",
        owner: "pulsar-edit",
        readme: "This is a readme!",
        metadata: {
          name: "test-package",
          license: "MIT",
          version: "1.0.0"
        },
        releases: { latest: "1.0.0" },
        versions: {
          "1.0.0": {
            sha: "1234",
            name: "test-package",
            version: "1.0.0",
            tarball_url: "https://nowhere.com"
          }
        },
        repository: {
          url: "https://github.com/pulsar-edit/test-package",
          type: "git"
        },
        creation_method: "Test Package"
      },
      owner: "pulsar-edit",
      stargazers_count: "1",
      versions: [
        {
          id: 10,
          meta: {
            sha: "1234",
            name: "test-package",
            version: "1.0.0",
            tarball_url: "https://nowhere.com"
          },
          engine: { atom: "*" },
          semver: "1.0.0",
          license: "MIT",
          package: "1234",
          hasGrammar: false,
          hasSnippets: false,
          supportedLanguages: null
        }
      ]
    };

    const parsed = await pof(data);

    expect(parsed).toMatchSchema(schema);
  });
});

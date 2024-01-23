const pos = require("../../../src/models/constructPackageObjectShort.js");
const schema = require("../../models/packageObjectShort.js").test;

describe("Parses Data, as expected to be returned by the Database", () => {
  test("Correctly Parses normal data", async () => {
    const data = {
      name: "test-package",
      data: {
        name: "test-package",
        owner: "pulsar-edit",
        readme: "This is a readme!",
        metadata: {
          name: "test-package",
          license: "MIT",
          version: "1.0.0",
        },
        releases: { latest: "1.0.0" },
        versions: {
          "1.0.0": {
            sha: "1234",
            name: "test-package",
            version: "1.0.0",
            tarball_url: "https://nowhere.com",
          },
        },
        repository: {
          url: "https://github.com/pulsar-edit/test-package",
          type: "git",
        },
        creation_method: "Test Package",
      },
      downloads: "0",
      owner: "pulsar-edit",
      stargazers_count: "0",
      semver: "1.0.0",
      created: "2024-01-20T00:46:57.014Z",
      updated: "2024-01-20T00:46:57.014Z",
      creation_method: "Test Package",
    };

    const parsed = await pos(data);

    expect(parsed).toMatchSchema(schema);
  });
});

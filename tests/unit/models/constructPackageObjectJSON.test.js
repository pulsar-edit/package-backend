const poj = require("../../../src/models/constructPackageObjectJSON.js");
const schema = require("../../models/packageObjectJSON.js").test;

describe("Parses Data, as expected to be returned by the Database", () => {
  test("Correctly Parses normal data", async () => {
    const data = {
      semver: "1.0.0",
      license: "MIT",
      engines: { atom: "*" },
      meta: {
        sha: "1234",
        name: "package-test",
        version: "1.0.0",
        tarball_url: "https://nowhere.com",
      },
    };

    const parsed = await poj(data);

    expect(parsed).toMatchSchema(schema);
  });
});

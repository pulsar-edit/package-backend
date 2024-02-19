const endpoint = require("../../src/controllers/getPackagesPackageName.js");
const database = require("../../src/database/_export.js");
const context = require("../../src/context.js");

const genPackage = require("../helpers/package.jest.js");

describe("Behaves as expected", () => {
  test("Returns 'not_found' when package doesn't exist", async () => {
    const sso = await endpoint.logic(
      {
        engine: false,
        packageName: "anything",
      },
      context
    );

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("not_found");
  });

  test("Returns package on success", async () => {
    await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/get-package-test", {
        versions: ["1.1.0", "1.0.0"],
      })
    );

    const sso = await endpoint.logic(
      {
        engine: false,
        packageName: "get-package-test",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content.name).toBe("get-package-test");
    expect(sso.content.owner).toBe("confused-Techie");
    expect(sso).toMatchEndpointSuccessObject(endpoint);
    await database.removePackageByName("get-package-test", true);
  });

  test("Returns a bundled package without it existing in the database", async () => {
    const sso = await endpoint.logic(
      {
        engine: false,
        packageName: "settings-view",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content.name).toBe("settings-view");
    expect(sso.content.owner).toBe("pulsar-edit");
    expect(sso.content.repository.url).toBe(
      "https://github.com/pulsar-edit/pulsar"
    );
    expect(sso).toMatchEndpointSuccessObject(endpoint);
  });
});

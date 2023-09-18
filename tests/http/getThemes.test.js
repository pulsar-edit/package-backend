const endpoint = require("../../src/controllers/getThemes.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

describe("Behaves as expected", () => {

  test("Calls the correct function", async () => {
    const context = require("../../src/context.js");
    const localContext = context;
    const spy = jest.spyOn(localContext.database, "getSortedPackages");

    await endpoint.logic({}, localContext);

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });

  test("Returns empty array with no packages present", async () => {
    // Testing for if no packages exist
    const sso = await endpoint.logic(
      {
        page: "1",
        sort: "downloads",
        direction: "desc"
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(0);
    expect(sso.link).toBe(
      "<https://api.pulsar-edit.dev/api/themes?page=0&sort=downloads&direction=desc>;"
      + ' rel="self", '
      + "<https://api.pulsar-edit.dev/api/themes?page=0&sort=downloads&direction=desc>;"
      + ' rel="last"'
    );
  });
  test("Returns proper data on success", async () => {
    const addName = await database.insertNewPackage({
      name: "test-package",
      repository: "https://github.com/confused-Techie/package-backend",
      creation_method: "Test Package",
      releases: {
        latest: "1.1.0"
      },
      readme: "This is a readme!",
      metadata: {
        name: "test-package",
        theme: "syntax"
      },
      versions: {
        "1.1.0": {
          dist: {
            tarball: "download-url",
            sha: "1234"
          },
          name: "test-package"
        },
        "1.0.0": {
          dist: {
            tarball: "download-url",
            sha: "1234"
          },
          name: "test-package"
        }
      }
    });

    const sso = await endpoint.logic(
      {
        page: "1",
        sort: "downloads",
        direction: "desc"
      },
      context
    );
    console.log(sso);
    expect(false).toBeTruthy();
    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("test-package");
    expect(sso.link).toBe(
      "<https://api.pulsar-edit.dev/api/themes?page=1&sort=downloads&direction=desc>;"
      + ' rel="self", '
      + "<https://api.pulsar-edit.dev/api/themes?page=1&sort=downloads&direction=desc>;"
      + ' rel="last"'
    );

    await database.removePackageByName("test-package", true);
  });

  test("Returns bad SSO on failure", async () => {
    const localContext = context;
    localContext.database = {
      getSortedPackages: () => { return { ok: false, content: "Test Failure" }; }
    };

    const sso = await endpoint.logic(
      {
        page: "1",
        sort: "downloads",
        direction: "desc"
      },
      localContext
    );

    expect(sso.ok).toBe(false);
    expect(sso.content.content).toBe("Test Failure");
  });
});

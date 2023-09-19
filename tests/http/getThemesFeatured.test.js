const endpoint = require("../../src/controllers/getThemesFeatured.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

describe("Behaves as expected", () => {
  test("Calls the correct function", async () => {
    const localContext = context;
    const spy = jest.spyOn(localContext.database, "getFeaturedThemes");

    await endpoint.logic({}, localContext);

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });

  test("Returns not found with no packages present", async () => {
    const sso = await endpoint.logic({}, context);

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("not_found");
  });

  test("Returns proper data on success", async () => {
    const addPack = await database.insertNewPackage({
      // We know a currently featured package is 'atom-material-ui'
      name: "atom-material-ui",
      repository: "https://github.com/confused-Techie/package-backend",
      creation_method: "Test Package",
      releases: {
        latest: "1.1.0"
      },
      readme: "This is a readme!",
      metadata: {
        name: "atom-material-ui",
        theme: "ui"
      },
      versions: {
        "1.1.0": {
          dist: {
            tarball: "download-url",
            sha: "1234"
          },
          name: "atom-material-ui"
        },
        "1.0.0": {
          dist: {
            tarball: "download-url",
            sha: "1234"
          },
          name: "atom-material-ui"
        }
      }
    });

    const sso = await endpoint.logic({}, context);

    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("atom-material-ui");
    // TODO test object structure to known good
    let res = await database.removePackageByName("atom-material-ui", true);
    console.log("Res remove");
    console.log(res);
  });
});

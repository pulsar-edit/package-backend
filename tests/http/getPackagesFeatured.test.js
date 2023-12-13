const endpoint = require("../../src/controllers/getPackagesFeatured.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

describe("Behaves as expected", () => {
  test("Calls the correct function", async () => {
    const localContext = context;
    const spy = jest.spyOn(localContext.database, "getFeaturedPackages");

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
      // We know a currently featured package is 'x-terminal-reloaded'
      name: "x-terminal-reloaded",
      repository: {
        url: "https://github.com/Spiker985/x-terminal-reloaded",
        type: "git"
      },
      creation_method: "Test Package",
      releases: {
        latest: "1.1.0"
      },
      readme: "This is a readme!",
      metadata: {
        name: "atom-material-ui"
      },
      versions: {
        "1.1.0": {
          dist: {
            tarball: "download-url",
            sha: "1234"
          },
          name: "x-terminal-reloaded"
        },
        "1.0.0": {
          dist: {
            tarball: "download-url",
            sha: "1234"
          },
          name: "x-terminal-reloaded"
        }
      }
    });

    const sso = await endpoint.logic({}, context);

    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("x-terminal-reloaded");
    expect(sso).toMatchEndpointSuccessObject(endpoint);

    await database.removePackageByName("x-terminal-reloaded", true);
  });
});

const endpoint = require("../../src/controllers/getOwnersOwnerName.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

describe("Behaves as expected", () => {
  test("Calls the correct function", async () => {
    const localContext = context;
    const spy = jest.spyOn(localContext.database, "getSortedPackages");

    await endpoint.logic({}, localContext);

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });

  test("Returns empty array with no matching results", async () => {
    const sso = await endpoint.logic({
      owner: "i-dont-exist",
      page: "1",
      sort: "downloads",
      direction: "desc"
    }, context);

    expect(sso.ok).toBe(false);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(0);
  });

  test("Returns package with matching owner entry", async () => {
    await database.insertNewPackage({
      name: "get-owner-test",
      respository: {
        url: "https://github.com/pulsar-edit/pulsar",
        type: "git"
      },
      owner: "pulsar-edit",
      creation_method: "Test Package",
      releases: {
        latest: "1.0.0"
      },
      readme: "This is a readme!",
      metdata: {
        name: "get-owner-test"
      },
      versions: {
        "1.0.0": {
          dist: {
            tarball: "download-url",
            sha: "1234"
          },
          name: "get-owner-test"
        }
      }
    });

    const sso = await endpoint.logic({
      owner: "pulsar-edit"
    }, context);

    expect(sso.ok).toBe(true);
    expect(sso.content[0].name).toBe("get-owner-test");
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(0);
    expect(sso).toMatchEndpointSuccessObject(endpoint);
    await database.removePackageByName("get-owner-test", true);
  });
});

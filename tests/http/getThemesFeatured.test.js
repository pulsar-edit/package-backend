const endpoint = require("../../src/controllers/getThemesFeatured.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

const genPackage = require("../helpers/package.jest.js");

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
    await database.insertNewPackage(
      // We know a currently featured package is 'atom-material-ui'
      genPackage("https://github.com/confused-Techie/atom-material-ui", {
        extraVersionData: {
          theme: "ui",
        },
      })
    );

    const sso = await endpoint.logic({}, context);

    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("atom-material-ui");
    expect(sso).toMatchEndpointSuccessObject(endpoint);
    await database.removePackageByName("atom-material-ui", true);
  });
});

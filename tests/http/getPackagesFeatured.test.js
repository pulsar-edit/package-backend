const endpoint = require("../../src/controllers/getPackagesFeatured.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

const genPackage = require("../helpers/package.jest.js");

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
    await database.insertNewPackage(
      genPackage(
        // We know a currently featured package is 'x-terminal-reloaded'
        "https://github.com/Spiker985/x-terminal-reloaded",
        {
          versions: ["1.1.0", "1.0.0"],
        }
      )
    );

    const sso = await endpoint.logic({}, context);

    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("x-terminal-reloaded");
    expect(sso).toMatchEndpointSuccessObject(endpoint);

    await database.removePackageByName("x-terminal-reloaded", true);
  });
});

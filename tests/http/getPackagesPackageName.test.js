const endpoint = require("../../src/controllers/getPackagesPackageName.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

const genPackage = require("../helpers/package.jest.js");

describe("Behaves as expected", () => {
  test("Calls the correct function", async () => {
    const localContext = context;
    const spy = jest.spyOn(localContext.database, "getPackageByName");

    await endpoint.logic({}, localContext);

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });

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
      genPackage(
        "https://github.com/confused-Techie/get-package-test",
        {
          versions: [ "1.1.0", "1.0.0" ]
        }
      )
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
});

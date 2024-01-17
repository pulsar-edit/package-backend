const endpoint = require("../../src/controllers/getOwnersOwnerName.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

const genPackage = require("../helpers/package.jest.js");

describe("Behaves as expected", () => {
  test("Calls the correct function", async () => {
    const localContext = context;
    const spy = jest.spyOn(localContext.database, "getSortedPackages");

    await endpoint.logic({}, localContext);

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });

  test("Returns empty array with no matching results", async () => {
    const sso = await endpoint.logic(
      {
        owner: "i-dont-exist",
        page: "1",
        sort: "downloads",
        direction: "desc",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(0);
  });

  test("Returns package with matching owner entry", async () => {
    await database.insertNewPackage(
      genPackage("https://github.com/pulsar-cooperative/get-owner-test")
    );

    const sso = await endpoint.logic(
      {
        owner: "pulsar-cooperative",
        page: 1,
        sort: "downloads",
        direction: "desc",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content[0].name).toBe("get-owner-test");
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(1);
    expect(sso).toMatchEndpointSuccessObject(endpoint);

    await database.removePackageByName("get-owner-test", true);
  });
});

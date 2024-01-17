const endpoint = require("../../src/controllers/getPackages.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

const genPackage = require("../helpers/package.jest.js");

describe("Behaves as expected", () => {
  beforeAll(async () => {
    await database.insertNewPackage(
      genPackage(
        "https://github.com/unique_user/get-packages-test",
        {
          versions: [ "1.1.0", "1.0.0" ],
          extraVersionData: {
            providedServices: {
              refactor: {
                versions: { "0.0.1": "provideRefactor" }
              }
            }
          }
        }
      )
    );

    await database.insertNewPackage(
      genPackage(
        "https://github.com/savetheclocktower/calculator-light-ui",
        {
          versions: [ "9.0.0" ],
          extraVersionData: {
            providedServices: {
              another: {
                versions: { "0.1.1": "provideanother" }
              }
            }
          }
        }
      )
    );

  });

  afterAll(async () => {
    await database.removePackageByName("get-packages-test", true);
    await database.removePackageByName("calculator-light-ui", true);
  });

  test("Allows filtering by owner field", async () => {
    let sso = await endpoint.logic(
      {
        engine: false,
        owner: "unique_user",
        page: 1,
        sort: "downloads",
        direction: "desc",
        serviceVersion: false,
        fileExtension: false,
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("get-packages-test");
    expect(sso.content[0].owner).toBe("unique_user");
    expect(sso).toMatchEndpointSuccessObject(endpoint);
  });

  test("Allows filtering by services field", async () => {
    let sso = await endpoint.logic(
      {
        engine: false,
        service: "refactor",
        serviceType: "providedServices",
        page: 1,
        sort: "downloads",
        direction: "desc",
        serviceVersion: false,
        fileExtension: false,
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("get-packages-test");
    expect(sso.content[0].owner).toBe("unique_user");
    expect(sso).toMatchEndpointSuccessObject(endpoint);
  });

  test("Allows filtering by both owner and services", async () => {
    let sso = await endpoint.logic(
      {
        engine: false,
        owner: "unique_user",
        service: "refactor",
        serviceType: "providedServices",
        page: 1,
        sort: "downloads",
        direction: "desc",
        serviceVersion: false,
        fileExtension: false,
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("get-packages-test");
    expect(sso.content[0].owner).toBe("unique_user");
    expect(sso).toMatchEndpointSuccessObject(endpoint);
  });
});

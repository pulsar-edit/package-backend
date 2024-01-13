const endpoint = require("../../src/controllers/getPackages.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

describe("Behaves as expected", () => {
  beforeAll(async () => {
    await database.insertNewPackage({
      name: "get-packages-test",
      repository: {
        url: "https://github.com/unique_user/package-backend",
        type: "git",
      },
      owner: "unique_user",
      creation_method: "Test Package",
      releases: {
        latest: "1.1.0",
      },
      readme: "This is a readme!",
      metadata: {
        name: "get-packages-test",
        providedServices: {
          refactor: {
            versions: {
              "0.0.1": "provideRefactor",
            },
          },
        },
      },
      versions: {
        "1.1.0": {
          dist: {
            tarball: "download-url",
            sha: "1234",
          },
          name: "get-packages-test",
          providedServices: {
            refactor: {
              versions: {
                "0.0.1": "provideRefactor",
              },
            },
          },
        },
        "1.0.0": {
          dist: {
            tarball: "download-url",
            sha: "1234",
          },
          name: "get-packages-test",
          providedServices: {
            refactor: {
              versions: {
                "0.0.1": "provideRefactor",
              },
            },
          },
        },
      },
    });

    await database.insertNewPackage({
      name: "calculator-light-ui",
      repository: {
        url: "https://github.com/savetheclocktower/calculator-light-ui",
        type: "git",
      },
      owner: "savetheclocktower",
      creation_method: "Test Package",
      releases: {
        latest: "9.0.0",
      },
      readme: "This is a second readme!",
      metadata: {
        name: "get-packages-test",
        providedServices: {
          another: {
            versions: {
              "0.1.1": "provideanother",
            },
          },
        },
      },
      versions: {
        "9.0.0": {
          dist: {
            tarball: "download-url",
            sha: "5678",
          },
          name: "get-packages-test",
          providedServices: {
            another: {
              versions: {
                "0.1.1": "provideanother",
              },
            },
          },
        },
      },
    });
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

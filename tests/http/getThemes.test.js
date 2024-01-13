const endpoint = require("../../src/controllers/getThemes.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

const genPackage = require("../helpers/package.jest.js");

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
        direction: "desc",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(0);
    expect(sso.link).toBe(
      `<${context.config.server_url}/api/themes?page=0&sort=downloads&direction=desc>;` +
        ' rel="self", ' +
        `<${context.config.server_url}/api/themes?page=0&sort=downloads&direction=desc>;` +
        ' rel="last"'
    );
  });
  test("Returns proper data on success", async () => {
    await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/test-package", {
        versions: [ "1.1.0", "1.0.0" ],
        extraVersionData: {
          theme: "syntax"
        }
      })
    );

    const sso = await endpoint.logic(
      {
        page: "1",
        sort: "downloads",
        direction: "desc",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("test-package");
    expect(sso.content[0].owner).toBe("confused-Techie");
    expect(sso.link).toBe(
      `<${context.config.server_url}/api/themes?page=1&sort=downloads&direction=desc>;` +
        ' rel="self", ' +
        `<${context.config.server_url}/api/themes?page=1&sort=downloads&direction=desc>;` +
        ' rel="last"'
    );
    expect(sso).toMatchEndpointSuccessObject(endpoint);
    await database.removePackageByName("test-package", true);
  });

  test("Returns bad SSO on failure", async () => {
    const localContext = context;
    localContext.database = {
      getSortedPackages: () => {
        return { ok: false, content: "Test Failure" };
      },
    };

    const sso = await endpoint.logic(
      {
        page: "1",
        sort: "downloads",
        direction: "desc",
      },
      localContext
    );

    expect(sso.ok).toBe(false);
    expect(sso.content.content).toBe("Test Failure");
  });
});

describe("HTTP Handling works", () => {
  test("Calls the right function", async () => {
    const request = require("supertest");
    const app = require("../../src/setupEndpoints.js");

    const spy = jest.spyOn(endpoint, "logic");

    const res = await request(app).get("/api/themes");

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });
});

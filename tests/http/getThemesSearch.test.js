const endpoint = require("../../src/controllers/getThemesSearch.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

const genPackage = require("../helpers/package.jest.js");

describe("Behaves as expected", () => {
  test("Calls the correct function", async () => {
    const localContext = context;
    const spy = jest.spyOn(localContext.database, "simpleSearch");

    await endpoint.logic({}, localContext);

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });

  test("Returns zero length array when not found", async () => {
    const sso = await endpoint.logic(
      {
        sort: "downloads",
        page: "1",
        direction: "desc",
        query: "hello-world",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(0);
  });

  test("Returns array on success", async () => {
    await database.insertNewPackage(
      genPackage("https://github.com/confused-Techie/atom-material-syntax", {
        extraVersionData: {
          theme: "ui"
        }
      })
    );

    const sso = await endpoint.logic(
      {
        sort: "downloads",
        page: "1",
        direction: "desc",
        query: "atom-material",
      },
      context
    );

    expect(sso.ok).toBe(true);
    expect(sso.content).toBeArray();
    expect(sso.content.length).toBe(1);
    expect(sso.content[0].name).toBe("atom-material-syntax");
    expect(sso).toMatchEndpointSuccessObject(endpoint);
    await database.removePackageByName("atom-material-syntax", true);
  });

  test("Returns error on db call failure", async () => {
    // Moved to last position, since it modifies our shallow copied context
    const localContext = context;
    localContext.database = {
      simpleSearch: () => {
        return { ok: false, content: "Test Error" };
      },
    };

    const sso = await endpoint.logic(
      {
        sort: "downloads",
        page: "1",
        direction: "desc",
        query: "hello-world",
      },
      localContext
    );

    expect(sso.ok).toBe(false);
    expect(sso.content.content).toBe("Test Error");
  });
});

const endpoint = require("../../src/controllers/postPackagesPackageNameVersions.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

describe("POST /api/packages/:packageName/versions", () => {
  test("Fails with bad auth if given a bad auth", async () => {
    const localContext = context;
    localContext.auth.verifyAuth = () => {
      return {
        ok: false,
        short: "unauthorized",
        context: "Bad Auth Mock Return",
      };
    };

    const sso = await endpoint.logic({}, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.short).toBe("unauthorized");
  });

  // This is where the original tests ended here
  test.todo("Write the tests that are now possible");
});

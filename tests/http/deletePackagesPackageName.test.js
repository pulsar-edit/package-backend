const endpoint = require("../../src/controllers/deletePackagesPackageName.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

describe("DELETE /api/packages/:packageName", () => {
  test("Fails with bad auth", async () => {
    const localContext = context;
    localContext.auth.verifyAuth = () => {
      return {
        ok: false,
        short: "unauthorized",
        content: "Bad Auth Mock Return",
      };
    };

    const sso = await endpoint.logic({}, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("unauthorized");
  });
  test("Fails with not found with bad package", async () => {
    const localContext = context;
    localContext.auth.verifyAuth = () => {
      return {
        ok: true,
        content: {
          token: "valid-token",
          id: 9999,
          node_id: "dlt-pkg-test-user-node-id",
          username: "dlt-pkg-test-user-node-id",
          avatar: "https://roadtonowhere.com",
        },
      };
    };

    const sso = await endpoint.logic(
      {
        auth: "valid-token",
        packageName: "no-exist",
      },
      localContext
    );

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("not_found");
  });

  test("Successfully deletes a package", async () => {
    await database.insertNewPackage({
      name: "dlt-pkg-by-name-test",
      repository: {
        url: "https://github.com/confused-Techie/package-backend",
        type: "git",
      },
      owner: "confused-Techie",
      creation_method: "Test Package",
      releases: {
        latest: "1.0.0",
      },
      readme: "This is a readme!",
      metadata: { name: "dlt-pkg-by-name-test" },
      versions: {
        "1.0.0": {
          dist: {
            tarball: "download-url",
            sha: "1234",
          },
          name: "dlt-pkg-by-name-test",
        },
      },
    });

    let addUser = await database.insertNewUser(
      "dlt-pkg-test-user-node-id",
      "dlt-pkg-test-user-node-id",
      "https://roadtonowhere.com"
    );

    expect(addUser.ok).toBe(true);

    const localContext = context;
    localContext.auth.verifyAuth = () => {
      return {
        ok: true,
        content: {
          token: "valid-token",
          // The user data must match whats in the db
          id: addUser.content.id,
          node_id: addUser.content.node_id,
          username: addUser.content.username,
          avatar: addUser.content.avatar,
        },
      };
    };

    localContext.vcs.ownership = () => {
      return {
        ok: true,
        content: "admin",
      };
    };

    const sso = await endpoint.logic(
      {
        auth: "valid-token",
        packageName: "dlt-pkg-by-name-test",
      },
      localContext
    );

    expect(sso.ok).toBe(true);
    expect(sso.content).toBe(false);

    let doesPackageStillExist = await database.getPackageByName(
      "dlt-pkg-by-name-test"
    );

    expect(doesPackageStillExist.ok).toBe(false);
    expect(doesPackageStillExist.short).toBe("not_found");

    let isPackageNameAvailable = await database.packageNameAvailability(
      "dlt-pkg-by-name-test"
    );

    expect(isPackageNameAvailable.ok).toBe(false);
    expect(isPackageNameAvailable.short).toBe("not_found");
    expect(isPackageNameAvailable.content).toBe(
      "dlt-pkg-by-name-test is not available to be used for a new package."
    );
  });
});

const endpoint = require("../../src/controllers/deletePackagesPackageNameVersionsVersionName.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

describe("DELETE /api/packages/:packageName/versions/:versionName", () => {
  test("Fails with bad auth", async () => {
    const localContext = context;
    localContext.auth.verifyAuth = () => {
      return {
        ok: false,
        short: "unauthorized",
        content: "Bad Auth Mock Return",
      };
    };

    const sso = await endpoint.logic({ versionName: "" }, localContext);

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
          node_id: "dlt-pkg-ver-user-node-id",
          username: "dlt-pkg-ver-user-node-id",
          avatar: "https://roadtonowhere.com",
        },
      };
    };

    const sso = await endpoint.logic(
      {
        auth: "valid-token",
        packageName: "no-exist",
        versionName: "1.0.0",
      },
      localContext
    );

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("not_found");
  });
  test("Successfully deletes a package version", async () => {
    await database.insertNewPackage({
      name: "dlt-pkg-ver-by-name-test",
      repository: {
        url: "https://github.com/confused-Techie/package-backend",
        type: "git",
      },
      owner: "confused-Techie",
      creation_method: "Test Package",
      releases: {
        latest: "1.0.1",
      },
      readme: "This is a readme!",
      metadata: { name: "dlt-pkg-ver-by-name-test" },
      versions: {
        "1.0.1": {
          dist: {
            tarball: "download-url",
            sha: "1234",
          },
          name: "dlt-pkg-ver-by-name-test",
        },
        "1.0.0": {
          dist: {
            tarball: "download-url",
            sha: "1234",
          },
          name: "dlt-pkg-ver-by-name-test",
        },
      },
    });

    let addUser = await database.insertNewUser(
      "dlt-pkg-ver-test-user-node-id",
      "dlt-pkg-ver-test-user-node-id",
      "https://roadotonowhere.com"
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
        packageName: "dlt-pkg-ver-by-name-test",
        versionName: "1.0.1",
      },
      localContext
    );

    expect(sso.ok).toBe(true);
    expect(sso.content).toBe(false);

    let currentPackageData = await database.getPackageByName(
      "dlt-pkg-ver-by-name-test"
    );

    expect(currentPackageData.ok).toBe(true);

    currentPackageData = await context.utils.constructPackageObjectFull(
      currentPackageData.content
    );

    expect(currentPackageData.name).toBe("dlt-pkg-ver-by-name-test");
    // Does it modify the latest package version
    expect(currentPackageData.releases.latest).toBe("1.0.0");
    expect(currentPackageData.versions["1.0.0"]).toBeTruthy();
    expect(currentPackageData.versions["1.0.1"]).toBeFalsy();

    // cleanup
    await database.removePackageByName("dlt-pkg-ver-by-name-test", true);
  });
});

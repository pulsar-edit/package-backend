const endpoint = require("../../src/controllers/postPackages.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");

describe("POST /api/packages Behaves as expected", () => {

  test("Fails with 'unauthorized' when bad token is passed", async () => {
    const localContext = context;
    localContext.auth.verifyAuth = () => {
      return {
        ok: false,
        short: "unauthorized",
        content: "Bad Auth Mock Return"
      };
    };

    const sso = await endpoint.logic({}, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("unauthorized");
  });

  test("Fails with 'bad repo' when no repo is passed", async () => {
    const localContext = context;
    localContext.auth.verifyAuth = () => {
      return {
        ok: true,
        content: {
          token: "valid-token",
          id: 9999,
          node_id: "post-pkg-publish-test-user-node-id",
          username: "post-pkg-publish-test-user",
          avatar: "https://roadtonowhere.com"
        }
      };
    };

    const sso = await endpoint.logic({
      repository: "",
      auth: "valid-token"
    }, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.short).toBe("bad_repo");
  });

  test("Fails when a bad repo format is passed", async () => {
    const localContext = context;
    localContext.auth.verifyAuth = () => {
      return {
        ok: true,
        content: {
          token: "valid-token",
          id: 9999,
          node_id: "post-pkg-publish-test-user-node-id",
          username: "post-pkg-publish-test-user",
          avatar: "https://roadtonowhere.com"
        }
      };
    };

    const sso = await endpoint.logic({
      repository: "bad-format",
      auth: "valid-token"
    }, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.short).toBe("bad_repo");
  });

  test("Fails if the package already exists", async () => {
    const localContext = context;
    localContext.auth.verifyAuth = () => {
      return {
        ok: true,
        content: {
          token: "valid-token",
          id: 9999,
          node_id: "post-pkg-publish-test-user-node-id",
          username: "post-pkg-publish-test-user",
          avatar: "https://roadtonowhere.com"
        }
      };
    };

    await database.insertNewPackage({
      name: "post-packages-test-package",
      repository: {
        url: "https://github.com/confused-Techie/package-backend",
        type: "git"
      },
      creation_method: "Test Package",
      releases: { latest: "1.1.0" },
      readme: "This is a readme!",
      metadata: { name: "post-packages-test-package" },
      versions: {
        "1.1.0": {
          dist: {
            tarball: "download-url",
            sha: "1234"
          },
          name: "post-packages-test-package"
        }
      }
    });

    const sso = await endpoint.logic({
      repository: "confused-Techie/post-packages-test-package",
      auth: "valid-token"
    }, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.short).toBe("package_exists");

    await database.removePackageByName("post-packages-test-package", true);
  });

  // This is the fully migrated test set that we previously had
  // But with the changes made we should now be able to properly test
  // everything here.
  test.todo("post Packages test that actually modify data");
});

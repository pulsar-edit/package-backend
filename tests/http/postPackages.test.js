const endpoint = require("../../src/controllers/postPackages.js");
const database = require("../../src/database/_export.js");
const context = require("../../src/context.js");

describe("POST /api/packages Behaves as expected", () => {
  test("Fails with 'unauthorized' when bad token is passed", async () => {
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
          avatar: "https://roadtonowhere.com",
        },
      };
    };

    const sso = await endpoint.logic(
      {
        repository: "",
        auth: "valid-token",
      },
      localContext
    );

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
          avatar: "https://roadtonowhere.com",
        },
      };
    };

    const sso = await endpoint.logic(
      {
        repository: "bad-format",
        auth: "valid-token",
      },
      localContext
    );

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
          avatar: "https://roadtonowhere.com",
        },
      };
    };
    localContext.vcs.ownership = () => {
      return {
        ok: true,
        content: "admin",
      };
    };
    localContext.vcs.newPackageData = () => {
      return {
        ok: true,
        content: {
          name: "post-pkg-test-pkg-exists",
          repository: {
            url: "https://github.com/confused-Techie/post-pkg-test-pkg-exists",
            type: "git",
          },
          owner: "confused-Techie",
          downloads: 0,
          stargazers_count: 0,
          creation_method: "Test Package",
          releases: {
            latest: "1.0.0",
          },
          readme: "This is a readme!",
          metadata: { name: "post-pkg-test-pkg-exists" },
          versions: {
            "1.0.0": {
              dist: {
                tarball: "download-url",
                sha: "1234",
              },
              name: "post-pkg-test-pkg-exists",
            },
          },
        },
      };
    };

    await database.insertNewPackage({
      name: "post-pkg-test-pkg-exists",
      repository: {
        url: "https://github.com/confused-Techie/post-pkg-test-pkg-exists",
        type: "git",
      },
      creation_method: "Test Package",
      owner: "confused-Techie",
      releases: { latest: "1.1.0" },
      readme: "This is a readme!",
      metadata: { name: "post-pkg-test-pkg-exists" },
      versions: {
        "1.1.0": {
          dist: {
            tarball: "download-url",
            sha: "1234",
          },
          name: "post-pkg-test-pkg-exists",
        },
      },
    });

    const sso = await endpoint.logic(
      {
        repository: "confused-Techie/post-pkg-test-pkg-exists",
        auth: "valid-token",
      },
      localContext
    );

    expect(sso.ok).toBe(false);
    expect(sso.short).toBe("package_exists");

    await database.removePackageByName("post-pkg-test-pkg-exists", true);
  });

  test("Successfully publishes a new package", async () => {
    let addUser = await database.insertNewUser(
      "post-pkg-test-user-node-id",
      "post-pkg-test-user-node-id",
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
    localContext.vcs.newPackageData = () => {
      return {
        ok: true,
        content: {
          name: "post-pkg-test-pkg-name",
          repository: {
            url: "https://github.com/confused-Techie/package-backend",
            type: "git",
          },
          owner: "confused-Techie",
          downloads: 0,
          stargazers_count: 0,
          creation_method: "Test Package",
          releases: {
            latest: "1.0.0",
          },
          readme: "This is a readme!",
          metadata: { name: "post-pkg-test-pkg-name" },
          versions: {
            "1.0.0": {
              dist: {
                tarball: "download-url",
                sha: "1234",
              },
              name: "post-pkg-test-pkg-name",
            },
          },
        },
      };
    };

    const sso = await endpoint.logic(
      {
        repository: "confused-Techie/post-pkg-test-pkg-name",
        auth: "valid-token",
      },
      localContext
    );

    expect(sso.ok).toBe(true);
    expect(sso.content.name).toBe("post-pkg-test-pkg-name");
    expect(sso.content.releases.latest).toBe("1.0.0");

    // Can we get the package by a specific version
    let packByVer = await database.getPackageVersionByNameAndVersion(
      "post-pkg-test-pkg-name",
      "1.0.0"
    );

    expect(packByVer.ok).toBe(true);

    packByVer = await context.utils.constructPackageObjectJSON(
      packByVer.content
    );

    expect(packByVer.name).toBe("post-pkg-test-pkg-name");
    expect(packByVer.dist.tarball).toContain(
      "/api/packages/post-pkg-test-pkg-name/versions/1.0.0"
    );

    // Cleanup
    await database.removePackageByName("post-pkg-test-pkg-name", true);
  });
});

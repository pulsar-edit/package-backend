const endpoint = require("../../src/controllers/postPackagesPackageNameStar.js");
const database = require("../../src/database/_export.js");
const context = require("../../src/context.js");

describe("POST /api/packages/:packageName/star", () => {
  test("Fails with bad auth, with no auth", async () => {
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
          id: 99999,
          node_id: "post-pkg-star-test-user-node-id",
          username: "post-pkg-star-test-user-node-id",
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

  test("Returns package and updates star count on success", async () => {
    await database.insertNewPackage({
      name: "post-packages-star-test",
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
      metadata: { name: "post-packages-star-test" },
      versions: {
        "1.0.0": {
          dist: {
            tarball: "download-url",
            sha: "1234",
          },
          name: "post-packages-star-test",
        },
      },
    });

    let addUser = await database.insertNewUser(
      "post-pkg-star-test-user-node-id",
      "post-pkg-star-test-user-node-id",
      "https://roadtonowhere.com"
    );

    expect(addUser.ok).toBe(true);

    const localContext = context;
    localContext.auth.verifyAuth = () => {
      return {
        ok: true,
        content: {
          token: "valid-token",
          // The user data, specifically the ID must match for starring to work
          id: addUser.content.id,
          node_id: addUser.content.node_id,
          username: addUser.content.username,
          avatar: addUser.content.avatar,
        },
      };
    };

    const sso = await endpoint.logic(
      {
        auth: "valid-token",
        packageName: "post-packages-star-test",
      },
      localContext
    );

    expect(sso.ok).toBe(true);
    expect(sso.content.name).toBe("post-packages-star-test");
    expect(sso.content.stargazers_count).toBe("1");
    expect(sso).toMatchEndpointSuccessObject(endpoint);
    await database.removePackageByName("post-packages-star-test", true);
  });
});

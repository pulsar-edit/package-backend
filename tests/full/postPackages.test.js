const { Buffer } = require("node:buffer");
const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");

describe("POST /api/packages", () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect("127.0.0.1");
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test("Fails when bad auth is provided", async () => {
    // == Setup
    nock("https://api.github.com/").get("/user").reply(401, {
      message: "Requires authentication"
    });

    // == Test
    const res = await supertest(app)
      .post("/api/packages")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test("Fails when no package name is provided", async () => {
    // == Setup
    const addUser = await database.insertNewUser(
      "post-pkg-publish-test-user-node-id",
      "post-pkg-publish-test-user-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "post-pkg-publish-test-user-node-id"
    });

    // == Test
    const res = await supertest(app)
      .post("/api/packages")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(400);
    expect(res.body.message).toBe("That repo does not exist, or is inaccessible: Repository is missing.");

    // == Cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });

  test("Fails when a bad repository format is provided", async () => {
    // == Setup
    const addUser = await database.insertNewUser(
      "post-pkg-publish-test-user-node-id",
      "post-pkg-publish-test-user-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "post-pkg-publish-test-user-node-id"
    });

    // == Test
    const res = await supertest(app)
      .post("/api/packages")
      .set({ Authorization: "any-token-will-do" })
      .query({ repository: "this-isn't-valid-at-all" });

    expect(res).toHaveHTTPCode(400);
    expect(res.body.message).toBe("That repo does not exist, or is inaccessible: Repository is missing.");
    // TODO ?? Do we want this to be more specific?

    // == Cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });

  test("Successfully publishes new package", async () => {
    // == Setup
    // Add User
    const addUser = await database.insertNewUser(
      "post-pkg-publish-test-user-node-id",
      "post-pkg-publish-test-user-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    // Return good auth from github
    nock("https://api.github.com").get("/user").reply(200, {
      node_id: "post-pkg-publish-test-user-node-id"
    });

    // Ensure user has ownership of repo
    nock("https://api.github.com/").get("/repos/confused-Techie/my-non-original-package/collaborators?page=1")
      .reply(200, [
        {
          node_id: "post-pkg-publish-test-user-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true
          },
          role_name: "Admin"
        }
      ]);

    // Ensure we can report the repository exists
    nock("https://api.github.com").get("/repos/confused-Techie/my-non-original-package")
      .reply(200, {
        full_name: "confused-Techie/my-non-original-package"
      });

    // ENsure we can get the readme
    nock("https://api.github.com").get("/repos/confused-Techie/my-non-original-package/readme?ref=v1.0.0")
      .reply(200, {
        content: Buffer.from("# A Readme!").toString("base64"),
        encoding: "base64"
      });

    // Ensure we can get the tags
    nock("https://api.github.com").get("/repos/confused-Techie/my-non-original-package/tags")
      .reply(200, [
        {
          name: "v1.0.0",
          tarball_url: "https://api.github.com/repos/confused-Techie/my-non-original-package/tarball/refs/tags/v1.0.0",
          commit: {
            sha: "09f",
            url: "https://api.github.com/repos/confused-Techie/my-non-original-package/commits/09f"
          }
        }
      ]);

    // Ensure we can get the `package.json`
    nock("https://api.github.com").get("/repos/confused-Techie/my-non-original-package/contents/package.json?ref=v1.0.0")
      .reply(200, {
        content: Buffer.from(JSON.stringify({
          name: "my-non-original-package",
          repository: "https://github.com/confused-Techie/my-non-original-package",
          license: "MIT",
          version: "1.0.0"
        })).toString("base64"),
        encoding: "base64"
      });

    // Fail any feature detection
    nock("https://api.github.com").get("/repos/confused-Techie/my-non-original-package/contents/snippets")
      .reply(404);

    nock("https://api.github.com").get("/repos/confused-Techie/my-non-original-package/contents/grammars")
      .reply(404);

    // == Test
    const res = await supertest(app)
      .post("/api/packages")
      .set({ Authorization: "any-token-will-do" })
      .query({ repository: "confused-Techie/my-non-original-package" });

    expect(res).toHaveHTTPCode(201);
    expect(res.body.name).toBe("my-non-original-package");
    expect(res.body.releases.latest).toContain("1.0.0");

    // == Cleanup
    const removePkg = await database.removePackageByName("my-non-original-package", true);
    expect(removePkg.ok).toBe(true);

    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });
});

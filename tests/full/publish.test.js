const fs = require("fs");
const { Buffer } = require("node:buffer");
const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");

function getFileEncoded(loc) {
  const file = fs.readFileSync(loc, { encoding: "utf8" });

  const buf = Buffer.from(file).toString("base64");

  return buf;
}

describe("can publish packages", () => {
  beforeAll(async () => {
    // Create our test user
    let addUser = await database.insertNewUser(
      "full-publish-test-user",
      "full-publish-test-user-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    nock.disableNetConnect();
    nock.enableNetConnect("127.0.0.1");
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  beforeEach(() => {
    // Ensure the ownership tests passes for our test user
    nock("https://api.github.com/").get("/user").reply(200, {
      node_id: "full-publish-test-user-node-id",
    });
  });

  afterEach(() => {
    // Remove any interceptors setup for this test
    nock.cleanAll();
  });

  test("when everything is bog standard", async () => {
    // Ensure user has ownership of repo
    nock("https://api.github.com/")
      .get("/repos/confused-Techie/a-pulsar-package/collaborators?page=1")
      .reply(200, [
        {
          node_id: "full-publish-test-user-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true,
          },
          role_name: "Admin",
        },
      ]);

    // Ensure we can report that the package exists
    nock("https://api.github.com")
      .get("/repos/confused-Techie/a-pulsar-package")
      .reply(200, {
        full_name: "confused-Techie/a-pulsar-package",
      });

    // Ensure we can get the readme
    nock("https://api.github.com")
      .get("/repos/confused-Techie/a-pulsar-package/readme")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/a-pulsar-package/readme.md"
        ),
        encoding: "base64",
      });

    // Ensure we can get the tags
    nock("https://api.github.com")
      .get("/repos/confused-Techie/a-pulsar-package/tags")
      .reply(200, require("./fixtures/a-pulsar-package/tags.js"));

    // Ensure we can get the `package.json`
    nock("https://api.github.com")
      .get("/repos/confused-Techie/a-pulsar-package/contents/package.json")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/a-pulsar-package/package.json"
        ),
        encoding: "base64",
      });

    // Lets fail any feature detection requests for now
    nock("https://api.github.com")
      .get("/repos/confused-Techie/a-pulsar-package/contents/snippets")
      .reply(404);

    nock("https://api.github.com")
      .get("/repos/confused-Techie/a-pulsar-package/contents/grammars")
      .reply(404);

    const res = await supertest(app)
      .post("/api/packages")
      .query({ repository: "confused-Techie/a-pulsar-package" })
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(201);

    const pack = res.body;

    expect(pack.name).toBe("a-pulsar-package");
    expect(pack).toMatchObject(require("./fixtures/a-pulsar-package/match.js"));

    await database.removePackageByName("a-pulsar-package", true);
  });

  test("when multiple tags are available", async () => {
    // Ensure user has ownership of repo
    nock("https://api.github.com/")
      .get("/repos/confused-Techie/b-pulsar-package/collaborators?page=1")
      .reply(200, [
        {
          node_id: "full-publish-test-user-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true,
          },
          role_name: "Admin",
        },
      ]);

    // Ensure we can report that the package exists
    nock("https://api.github.com")
      .get("/repos/confused-Techie/b-pulsar-package")
      .reply(200, {
        full_name: "confused-Techie/b-pulsar-package",
      });

    // Ensure we can get the readme
    nock("https://api.github.com")
      .get("/repos/confused-Techie/b-pulsar-package/readme")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/b-pulsar-package/readme.md"
        ),
        encoding: "base64",
      });

    // Ensure we can get the tags
    nock("https://api.github.com")
      .get("/repos/confused-Techie/b-pulsar-package/tags")
      .reply(200, require("./fixtures/b-pulsar-package/tags.js"));

    // Ensure we can get the `package.json`
    nock("https://api.github.com")
      .get("/repos/confused-Techie/b-pulsar-package/contents/package.json")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/b-pulsar-package/package.json"
        ),
        encoding: "base64",
      });

    // Lets fail any feature detection requests for now
    nock("https://api.github.com")
      .get("/repos/confused-Techie/b-pulsar-package/contents/snippets")
      .reply(404);

    nock("https://api.github.com")
      .get("/repos/confused-Techie/b-pulsar-package/contents/grammars")
      .reply(404);

    const res = await supertest(app)
      .post("/api/packages")
      .query({ repository: "confused-Techie/b-pulsar-package" })
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(201);

    const pack = res.body;

    expect(pack.name).toBe("b-pulsar-package");
    expect(pack).toMatchObject(require("./fixtures/b-pulsar-package/match.js"));

    await database.removePackageByName("b-pulsar-package", true);
  });

  test("when a package version is missing", async () => {
    // Ensure user has ownership of repo
    nock("https://api.github.com/")
      .get("/repos/confused-Techie/c-pulsar-package/collaborators?page=1")
      .reply(200, [
        {
          node_id: "full-publish-test-user-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true,
          },
          role_name: "Admin",
        },
      ]);

    // Ensure we can report that the package exists
    nock("https://api.github.com")
      .get("/repos/confused-Techie/c-pulsar-package")
      .reply(200, {
        full_name: "confused-Techie/c-pulsar-package",
      });

    // Ensure we can get the readme
    nock("https://api.github.com")
      .get("/repos/confused-Techie/c-pulsar-package/readme")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/c-pulsar-package/readme.md"
        ),
        encoding: "base64",
      });

    // Ensure we can get the tags
    nock("https://api.github.com")
      .get("/repos/confused-Techie/c-pulsar-package/tags")
      .reply(200, require("./fixtures/c-pulsar-package/tags.js"));

    // Ensure we can get the `package.json`
    nock("https://api.github.com")
      .get("/repos/confused-Techie/c-pulsar-package/contents/package.json")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/c-pulsar-package/package.json"
        ),
        encoding: "base64",
      });

    // Lets fail any feature detection requests for now
    nock("https://api.github.com")
      .get("/repos/confused-Techie/c-pulsar-package/contents/snippets")
      .reply(404);

    nock("https://api.github.com")
      .get("/repos/confused-Techie/c-pulsar-package/contents/grammars")
      .reply(404);

    // This test data has a `package.json` that declares it's version as '2.0.0'
    // But the tags file only provides `v1.0.0`
    // We expect this to fail because of the undiscoverable tag

    const res = await supertest(app)
      .post("/api/packages")
      .query({ repository: "confused-Techie/c-pulsar-package" })
      .set({ Authorization: "any-token-will-do" });

    let errMsg = "Server Error: From Bad Repo: Error: Unable to locate the tag";
    errMsg +=
      " for 'package.json' version '2.0.0'. Are you sure you published a matching tag?";

    expect(res).toHaveHTTPCode(500);
    expect(res.body.message).toBe(errMsg);
  });
});

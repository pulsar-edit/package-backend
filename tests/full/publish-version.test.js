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

describe("publish package versions", () => {
  beforeAll(async () => {
    // Create our test user
    let addUser = await database.insertNewUser(
      "full-publish-version-test-user",
      "full-publish-version-test-user-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    nock.disableNetConnect();
    nock.enableNetConnect("127.0.0.1");

    // Add our test package
    // ====================
     // Ensure the ownership tests passes for our test user
     nock("https://api.github.com").get("/user").reply(200, {
       node_id: "full-publish-version-test-user-node-id"
     });

     // Lets publish the initial version of our package to test additional versions with

     // Ensure user has ownership of our repo
     nock("https://api.github.com")
       .get("/repos/confused-Techie/d-pulsar-package/collaborators?page=1")
       .reply(200, [
         {
           node_id: "full-publish-version-test-user-node-id",
           permissions: {
             admin: true,
             maintain: true,
             push: true
           },
           role_name: "Admin"
         }
       ]);

     // Ensure we can report that the package exists
     nock("https://api.github.com")
       .get("/repos/confused-Techie/d-pulsar-package")
       .reply(200, {
         full_name: "confused-Techie/d-pulsar-package"
       });

     // Ensure we can get the readme
     nock("https://api.github.com")
       .get("/repos/confused-Techie/d-pulsar-package/readme?ref=v1.0.0")
       .reply(200, {
         content: getFileEncoded(
           "./tests/full/fixtures/d-pulsar-package/readme.md"
         ),
         encoding: "base64"
       });

     // Ensure we can get the tags
     nock("https://api.github.com")
       .get("/repos/confused-Techie/d-pulsar-package/tags")
       .reply(200, require("./fixtures/d-pulsar-package/initial-tags.js"));

     // Ensure we can get the 'package.json'
     nock("https://api.github.com")
       .get("/repos/confused-Techie/d-pulsar-package/contents/package.json?ref=v1.0.0")
       .reply(200, {
         content: getFileEncoded(
           "./tests/full/fixtures/d-pulsar-package/initial-package.json"
         ),
         encoding: "base64"
       });

     // Lets fail on any feature detection
     nock("https://api.github.com")
       .get("/repos/confused-Techie/d-pulsar-package/contents/snippets")
       .reply(404);

     nock("https://api.github.com")
       .get("/repos/confused-Techie/d-pulsar-package/contents/grammars")
       .reply(404);

     const res = await supertest(app)
       .post("/api/packages")
       .query({ repository: "confused-Techie/d-pulsar-package" })
       .set({ Authorization: "any-token-will-do" });

     expect(res).toHaveHTTPCode(201);
     expect(res.body.name).toBe("d-pulsar-package");
     // Notice we don't remove the package yet, until the end all of tests

  });

  afterAll(async () => {    
    // Lets delete our test package versions
    await database.removePackageByName("d-pulsar-package", true);

    nock.cleanAll();
    nock.enableNetConnect();
  });

  beforeEach(() => {
    // Ensure the ownership tests passes for our test user
    nock("https://api.github.com").get("/user").reply(200, {
      node_id: "full-publish-version-test-user-node-id"
    });
  });

  afterEach(() => {
    // Remove any interceptors setup for this test
    nock.cleanAll();
  });

  test("when the request to verify if the repo exists fails", async () => {
    // Ensure user has ownership of our repo
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/collaborators?page=1")
      .reply(200, [
        {
          node_id: "full-publish-version-test-user-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true
          },
          role_name: "Admin"
        }
      ]);

    // Ensure we can report that the package exists
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package")
      .reply(500);

    // Ensure we can get the readme
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/readme?ref=v2.0.0")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/d-pulsar-package/readme.md"
        ),
        encoding: "base64"
      });

    // Ensure we can get the tags
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/tags")
      .reply(200, require("./fixtures/d-pulsar-package/tags.js"));

    // Ensure we can get the 'package.json'
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/package.json?ref=v2.0.0")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/d-pulsar-package/package.json"
        ),
        encoding: "base64"
      });

    // Lets fail on any feature detection
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/snippets")
      .reply(404);

    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/grammars")
      .reply(404);

    const res = await supertest(app)
      .post("/api/packages/d-pulsar-package/versions")
      .query({ tag: "v2.0.0" })
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(500);
    expect(res.body.message).toBe(
      "Server Error: From Bad Repo: Failed to get repo: confused-Techie/d-pulsar-package - Server Error"
    );
  });

  test("when it fails to get the 'readme'", async () => {
    // Ensure user has ownership of our repo
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/collaborators?page=1")
      .reply(200, [
        {
          node_id: "full-publish-version-test-user-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true
          },
          role_name: "Admin"
        }
      ]);

    // Ensure we can report that the package exists
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package")
      .reply(200, {
        full_name: "confused-Techie/d-pulsar-package"
      });

    // Ensure we can get the readme
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/readme?ref=v2.0.0")
      .reply(500);

    // Ensure we can get the tags
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/tags")
      .reply(200, require("./fixtures/d-pulsar-package/tags.js"));

    // Ensure we can get the 'package.json'
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/package.json?ref=v2.0.0")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/d-pulsar-package/package.json"
        ),
        encoding: "base64"
      });

    // Lets fail on any feature detection
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/snippets")
      .reply(404);

    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/grammars")
      .reply(404);

    const res = await supertest(app)
      .post("/api/packages/d-pulsar-package/versions")
      .query({ tag: "v2.0.0" })
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(500);
    expect(res.body.message).toBe(
      "Server Error: From Bad Repo: Failed to get GitHub ReadMe confused-Techie/d-pulsar-package - Server Error - 500"
    );
  });

  test("when it fails to get the 'tags'", async () => {
    // Ensure user has ownership of our repo
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/collaborators?page=1")
      .reply(200, [
        {
          node_id: "full-publish-version-test-user-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true
          },
          role_name: "Admin"
        }
      ]);

    // Ensure we can report that the package exists
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package")
      .reply(200, {
        full_name: "confused-Techie/d-pulsar-package"
      });

    // Ensure we can get the readme
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/readme?ref=v2.0.0")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/d-pulsar-package/readme.md"
        ),
        encoding: "base64"
      });

    // Ensure we can get the tags
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/tags")
      .reply(500);

    // Ensure we can get the 'package.json'
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/package.json?ref=v2.0.0")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/d-pulsar-package/package.json"
        ),
        encoding: "base64"
      });

    // Lets fail on any feature detection
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/snippets")
      .reply(404);

    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/grammars")
      .reply(404);

    const res = await supertest(app)
      .post("/api/packages/d-pulsar-package/versions")
      .query({ tag: "v2.0.0" })
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(500);
    expect(res.body.message).toBe(
      "Server Error: From Server Error: Failed to get GitHub Tags for confused-Techie/d-pulsar-package - Server Error - 500"
    );
  });

  test("successfully publishes new version", async () => {
    // Ensure user has ownership of our repo
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/collaborators?page=1")
      .reply(200, [
        {
          node_id: "full-publish-version-test-user-node-id",
          permissions: {
            admin: true,
            maintain: true,
            push: true
          },
          role_name: "Admin"
        }
      ]);

    // Ensure we can report that the package exists
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package")
      .reply(200, {
        full_name: "confused-Techie/d-pulsar-package"
      });

    // Ensure we can get the readme
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/readme?ref=v2.0.0")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/d-pulsar-package/readme.md"
        ),
        encoding: "base64"
      });

    // Ensure we can get the tags
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/tags")
      .reply(200, require("./fixtures/d-pulsar-package/tags.js"));

    // Ensure we can get the 'package.json'
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/package.json?ref=v2.0.0")
      .reply(200, {
        content: getFileEncoded(
          "./tests/full/fixtures/d-pulsar-package/package.json"
        ),
        encoding: "base64"
      });

    // Lets fail on any feature detection
    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/snippets")
      .reply(404);

    nock("https://api.github.com")
      .get("/repos/confused-Techie/d-pulsar-package/contents/grammars")
      .reply(404);

    const res = await supertest(app)
      .post("/api/packages/d-pulsar-package/versions")
      .query({ tag: "v2.0.0" })
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(201);
    expect(res.body.content).toBe("Successfully added new version: d-pulsar-package@2.0.0");

    const resPack = await supertest(app)
      .get("/api/packages/d-pulsar-package");

    expect(resPack).toHaveHTTPCode(200);
    expect(resPack.body).toMatchObject(require("./fixtures/d-pulsar-package/match.js"));
  });
});

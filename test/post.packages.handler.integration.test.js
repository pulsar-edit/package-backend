const request = require("supertest");
const app = require("../src/main.js");

const { authMock } = require("./httpMock.helper.jest.js");

let tmpMock;

describe("Post /api/packages", () => {
  afterEach(() => {
    tmpMock.mockClear();
  });

  test("Fails with 'Bad Auth' when bad token is passed.", async () => {
    tmpMock = authMock({
      ok: false,
      short: "Bad Auth",
      content: "Bad Auth Mock Return for Dev User",
    });

    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/langauge-css" })
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
    expect(res).toHaveHTTPCode(401);
  });

  test("Fails with 'badRepoJSON' when no repo is passed.", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "valid-token",
        id: 9999,
        node_id: "post-pkg-publish-test-user-node-id",
        username: "post-pkg-publish-test-user",
        avatar: "https://roadtonowhere.com",
      },
    });

    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
    expect(res).toHaveHTTPCode(400);
  });

  test("Fails with 'badRepoJSON' when bad repo is passed.", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "valid-token",
        id: 9999,
        node_id: "post-pkg-publish-test-user-node-id",
        username: "post-pkg-publish-test-user",
        avatar: "https://roadtonowhere.com",
      },
    });

    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "not-exist" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
    expect(res).toHaveHTTPCode(400);
  });
  test("Fails with 'badRepoJSON' when Repo with a space is passed", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "valid-token",
        id: 9999,
        node_id: "post-pkg-publish-test-user-node-id",
        username: "post-pkg-publish-test-user",
        avatar: "https://roadtonowhere.com",
      },
    });

    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language CSS" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
    expect(res).toHaveHTTPCode(400);
  });

  test("Fails with 'publishPackageExists' when existing package is passed", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "valid-token",
        id: 9999,
        node_id: "post-pkg-publish-test-user-node-id",
        username: "post-pkg-publish-test-user",
        avatar: "https://roadtonowhere.com",
      },
    });

    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language-pon" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.publishPackageExists);
    expect(res).toHaveHTTPCode(409);
  });

  test.todo("Tests that actually modify data");
});

describe("POST /api/packages/:packageName/versions", () => {
  beforeEach(() => {
    tmpMock = authMock({
      ok: false,
      short: "Bad Auth",
      content: "Bad Auth Mock Return for Dev user",
    });
  });

  afterEach(() => {
    tmpMock.mockClear();
  });

  test("Returns Bad Auth appropriately with Bad Package", async () => {
    const res = await request(app).post(
      "/api/packages/language-golang/versions"
    );
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);
  });

  test.todo("Write all tests on this endpoint");
});

describe("POST /api/packages/:packageName/star", () => {
  afterEach(() => {
    tmpMock.mockClear();
  });

  test("Returns 401 with No Auth", async () => {
    tmpMock = authMock({
      ok: false,
      short: "Bad Auth",
      content: "Bad Auth Mock Return for Dev User",
    });

    const res = await request(app).post("/api/packages/language-gfm/star");
    expect(res).toHaveHTTPCode(401);
  });

  test("Returns Bad Auth Msg with No Auth", async () => {
    const res = await request(app).post("/api/packages/langauge-gfm/star");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Bad Auth", async () => {
    tmpMock = authMock({
      ok: false,
      short: "Bad Auth",
      content: "Bad Auth Mock Return for Dev User",
    });

    const res = await request(app)
      .post("/api/packages/language-gfm/star")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Msg with Bad Auth", async () => {
    tmpMock = authMock({
      ok: false,
      short: "Bad Auth",
      content: "Bad Auth Mock Return for Dev User",
    });

    const res = await request(app)
      .post("/api/packages/language-gfm/star")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns not found with bad package", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "valid-token",
      },
    });

    const res = await request(app)
      .post("/api/packages/no-exist/star")
      .set("Authorization", "valid-token");

    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns proper data on Success", async () => {
    const prev = await request(app).get("/api/packages/language-gfm");

    tmpMock = authMock({
      ok: true,
      content: {
        token: "valid-token",
        id: 999,
        node_id: "post-star-test-user-node-id",
        username: "post-star-test-user",
        avatar: "https://roadtonowhere.com",
      },
    });

    const res = await request(app)
      .post("/api/packages/language-gfm/star")
      .set("Authorization", "valid-token");

    tmpMock.mockClear();

    tmpMock = authMock({
      ok: true,
      content: {
        token: "valid-token",
        id: 999,
        node_id: "post-star-test-user-node-id",
        username: "post-star-test-user",
        avatar: "https://roadtonowhere.com",
      },
    });

    const dup = await request(app)
      .post("/api/packages/language-gfm/star")
      .set("Authorization", "valid-token");
    // We are preforming multiple checks in the single check,
    // because we want to test a star action when the package is already starred.

    // DESCRIBE: Returns Success Status Code
    expect(res).toHaveHTTPCode(200);
    // DESCRIBE: Returns same Package
    expect(res.body.name).toEqual("language-gfm");
    // DESCRIBE: Properly Increases Star Count
    expect(parseInt(res.body.stargazers_count, 10)).toEqual(
      parseInt(prev.body.stargazers_count, 10) + 1
    );
    // DESCRIBE: A duplicate Request Returns Success Status Code
    expect(dup).toHaveHTTPCode(200);
    // DESCRIBE: A duplicate Request keeps the star, but does not increase the count
    expect(parseInt(res.body.stargazers_count, 10)).toEqual(
      parseInt(dup.body.stargazers_count, 10)
    );
  });
});

describe("POST /api/packages/:packageName/versions/:versionName/events/uninstall", () => {
  // This endpoint is now being deprecated, so we will remove tests
  // for handling any kind of actual functionality.
  // Instead ensuring this returns as success to users are unaffected.
  test.todo(
    "This endpoint is deprecated, once it's fully removed, these tests should be too."
  );

  test("Returns 200 with Valid Package, Bad Version", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/versions/1.0.0/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(200);
    // Please note on Atom.io this would result in a 404. But the Pulsar Backend intentionally ignores the `version`
    // of the query. This is due to changes in the database structure.
  });
  test("Returns Json {ok: true } with Valid Package, Bad Version", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/versions/1.0.0/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res.body.ok).toBeTruthy();
    // Please note on Atom.io this would result in a 404. But the Pulsar Backend intentionally ignores the `version`
    // of the query. This is due to changes in the database structure.
  });
  test("Returns 200 on Success", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Json { ok: true } on Success", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res.body.ok).toBeTruthy();
  });
  test("After deprecating endpoint, ensure the endpoint has no effect", async () => {
    const orig = await request(app).get("/api/packages/language-css");
    const res = await request(app)
      .post("/api/packages/language-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "valid-token");
    const after = await request(app).get("/api/packages/language-css");
    expect(parseInt(orig.body.downloads, 10)).toEqual(
      parseInt(after.body.downloads, 10)
    );
  });
});

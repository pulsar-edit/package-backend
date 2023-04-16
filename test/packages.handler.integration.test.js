const request = require("supertest");
const app = require("../src/main.js");

describe("Post /api/packages", () => {
  test("Fails with 'Bad Auth' when bad token is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/langauge-css" })
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Fails with 401 with bad token", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language-css" })
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Fails with 'badRepoJSON' when no repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
  });
  test("Fails with 400 when no repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "" })
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(400);
  });
  test("Fails with 'badRepoJSON' when bad repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "notARepo" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
  });
  test("Fails with 'badRepoJSON' when Repo with a space is passed", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language CSS" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
  });
  test("Fails with 400 when bad repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "notARepo" })
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(400);
  });
  test("Fails with 'publishPackageExists' when existing package is passed", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language-css" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.publishPackageExists);
  });
  test("Fails with 409 when existing package is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language-css" })
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(409);
  });
  test.todo("Tests that actually modify data");
});

describe("DELETE /api/packages/:packageName", () => {
  test("No Auth, returns 401", async () => {
    const res = await request(app).delete("/api/packages/language-css");
    expect(res).toHaveHTTPCode(401);
  });
  test("No Auth, returns 'Bad Auth' with no token", async () => {
    const res = await request(app).delete("/api/packages/language-css");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Invalid Token", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Msg with Invalid Token", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns Bad Auth Msg with Valid Token, but no repo access", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css")
      .set("Authorization", "no-valid-token");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns Bad Auth Http with Valid Token, but no repo access", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css")
      .set("Authorization", "no-valid-token");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Success Message & HTTP with Valid Token", async () => {
    const res = await request(app)
      .delete("/api/packages/atom-material-ui")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(204);

    const after = await request(app).get("/api/packages");
    // This ensures our deleted package is no longer in the full package list.
    expect(after.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "atom-material-ui",
        }),
      ])
    );
  });
  // The ^^ above ^^ reads:
  //  * Expect your Array does NOT Equal
  //  * An Array that contains
  //  * An Object that Contains
  //  * The property { name: "atom-material-ui" }
});

describe("POST /api/packages/:packageName/star", () => {
  test("Returns 401 with No Auth", async () => {
    const res = await request(app).post("/api/packages/language-css/star");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Msg with No Auth", async () => {
    const res = await request(app).post("/api/packages/langauge-css/star");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Bad Auth", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/star")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Msg with Bad Auth", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/star")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 404 with bad package", async () => {
    const res = await request(app)
      .post("/api/packages/language-golang/star")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found msg with bad package", async () => {
    const res = await request(app)
      .post("/api/packages/language-golang/star")
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns proper data on Success", async () => {
    const prev = await request(app).get("/api/packages/language-css");
    const res = await request(app)
      .post("/api/packages/language-css/star")
      .set("Authorization", "valid-token");
    const dup = await request(app)
      .post("/api/packages/language-css/star")
      .set("Authorization", "valid-token");
    // We are preforming multiple checks in the single check,
    // because we want to test a star action when the package is already starred.

    // DESCRIBE: Returns Success Status Code
    expect(res).toHaveHTTPCode(200);
    // DESCRIBE: Returns same Package
    expect(res.body.name).toEqual("language-css");
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

describe("DELETE /api/packages/:packageName/star", () => {
  test("Returns 401 with No Auth", async () => {
    const res = await request(app).delete("/api/packages/langauge-css/star");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with No Auth", async () => {
    const res = await request(app).delete("/api/packages/langauge-css/star");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Bad Auth", async () => {
    const res = await request(app)
      .delete("/api/packages/langauge-css/star")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with Bad Auth", async () => {
    const res = await request(app)
      .delete("/api/packages/langauge-css/star")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 404 with bad package", async () => {
    const res = await request(app)
      .delete("/api/packages/language-golang/star")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with bad package", async () => {
    const res = await request(app)
      .delete("/api/packages/language-golang/star")
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 201 on Success", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/star")
      .set("Authorization", "all-star-token");
    expect(res).toHaveHTTPCode(201);
  });
  test("Returns 201 even when the package is not starred", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/star")
      .set("Authorization", "no-star-token");
    expect(res).toHaveHTTPCode(201);
  });
});

describe("DELETE /api/packages/:packageName/versions/:versionName", () => {
  test("Returns 401 with No Auth", async () => {
    const res = await request(app).delete(
      "/api/packages/langauge-css/versions/0.45.7"
    );
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with No Auth", async () => {
    const res = await request(app).delete(
      "/api/packages/langauge-css/versions/0.45.7"
    );
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Bad Auth", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/versions/0.45.7")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with Bad Auth", async () => {
    const res = await request(app)
      .delete("/api/packages/langauge-css/versions/0.45.7")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 404 with Bad Package", async () => {
    const res = await request(app)
      .delete("/api/packages/language-golang/versions/1.0.0")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Msg with Bad Package", async () => {
    const res = await request(app)
      .delete("/api/packages/langauge-golang/versions/1.0.0")
      .set("Authorization", "admin-token");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 404 with Valid Package & Bad Version", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/versions/1.0.0")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Msg with Valid Package & Bad Version", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/versions/1.0.0")
      .set("Authorization", "admin-token");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 204 on Success", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/versions/0.45.0")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(204);
  });
});

describe("POST /api/packages/:packageName/versions/:versionName/events/uninstall", () => {
  // This endpoint is now being deprecated, so we will remove tests
  // for handling any kind of actual functionality.
  // Instead ensuring this returns as success to users are unaffected.
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

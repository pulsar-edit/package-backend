const request = require("supertest");
const app = require("../src/main.js");

describe("Get /api/packages", () => {
  test("Should respond with a non empty array of packages.", async () => {
    const res = await request(app).get("/api/packages");
    expect(res.body).toBeArray();
    expect(res.body.length).toBeGreaterThan(0);
  });
  test("Should return valid Status Code", async () => {
    const res = await request(app).get("/api/packages");
    expect(res).toHaveHTTPCode(200);
  });
  test("Should respond with an array containing valid data", async () => {
    const res = await request(app).get("/api/packages");
    for (const p of res.body) {
      expect(typeof p.name === "string").toBeTruthy();
      // PostgreSQL numeric types are not fully compatible with js Number type
      expect(`${p.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
      expect(`${p.downloads}`.match(/^\d+$/) === null).toBeFalsy();
      expect(typeof p.releases.latest === "string").toBeTruthy();
    }
  });
  test("Should respond with an array not containing sensible data", async () => {
    const res = await request(app).get("/api/packages");
    for (const p of res.body) {
      expect(p.pointer === undefined).toBeTruthy();
    }
  });
  test("Should respond with the expected headers", async () => {
    const res = await request(app).get("/api/packages");
    expect(res.headers["link"].length).toBeGreaterThan(0);
    expect(res.headers["query-total"].match(/^\d+$/) === null).toBeFalsy();
    expect(res.headers["query-limit"].match(/^\d+$/) === null).toBeFalsy();
  });
  test("Should 404 on invalid Method", async () => {
    const res = await request(app).patch("/api/packages");
    expect(res).toHaveHTTPCode(404);
  });
  test("Should respond with an array of packages sorted by creation date.", async () => {
    const res = await request(app).get(
      "/api/packages?page=2&sort=created_at&direction=asc"
    );
    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
  });
  test("Should respond with an array of packages sorted by update date.", async () => {
    const res = await request(app).get(
      "/api/packages?page=2&sort=updated_at&direction=asc"
    );
    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
  });
  test("Should respond with an array of packages sorted by stars.", async () => {
    const res = await request(app).get(
      "/api/packages?page=1&sort=stars&direction=desc"
    );
    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body[0].name).toEqual("atom-material-ui");
  });
  test("Should return valid Status Code on invalid parameters", async () => {
    const res = await request(app).get(
      "/api/packages?page=nv&sort=nv&direction=nv"
    );
    expect(res).toHaveHTTPCode(200);
  });
});

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

describe("GET /api/packages/featured", () => {
  test("Returns Successful Status Code", async () => {
    const res = await request(app).get("/api/packages/featured");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Array", async () => {
    const res = await request(app).get("/api/packages/featured");
    expect(res.body).toBeArray();
  });
  test("Returns Valid Data", async () => {
    const res = await request(app).get("/api/packages/featured");
    for (const p of res.body) {
      expect(typeof p.name === "string").toBeTruthy();
      // PostgreSQL numeric types are not fully compatible with js Number type
      expect(`${p.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
      expect(`${p.downloads}`.match(/^\d+$/) === null).toBeFalsy();
      expect(typeof p.releases.latest === "string").toBeTruthy();
    }
  });
  test("Does Not Return Sensible Data", async () => {
    const res = await request(app).get("/api/packages/featured");
    for (const p of res.body) {
      expect(p.pointer === undefined).toBeTruthy();
    }
  });
});

describe("GET /api/packages/search", () => {
  test("Valid Search Returns Non Empty Array", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    expect(res.body).toBeArray();
    expect(res.body.length).toBeGreaterThan(0);
  });
  test("Valid Search Returns Success Status Code", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    expect(res).toHaveHTTPCode(200);
  });
  test("Valid Search Returns Valid Data", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    for (const p of res.body) {
      expect(typeof p.name === "string").toBeTruthy();
      // PostgreSQL numeric types are not fully compatible with js Number type
      expect(`${p.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
      expect(`${p.downloads}`.match(/^\d+$/) === null).toBeFalsy();
      expect(typeof p.releases.latest === "string").toBeTruthy();
    }
  });
  test("Valid Search Does Not Return Sensible Data", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    for (const p of res.body) {
      expect(p.pointer === undefined).toBeTruthy();
    }
  });
  test("Valid Search Returns Expected Headers", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    expect(res.headers["link"].length).toBeGreaterThan(0);
    expect(res.headers["query-total"].match(/^\d+$/) === null).toBeFalsy();
    expect(res.headers["query-limit"].match(/^\d+$/) === null).toBeFalsy();
  });
  test("Invalid Search Returns Array", async () => {
    const res = await request(app).get("/api/packages/search?q=not-one-match");
    expect(res.body).toBeArray();
  });
  test("Invalid Search Returns Empty Array", async () => {
    const res = await request(app).get("/api/packages/search?q=not-one-match");
    expect(res.body.length).toBeLessThan(1);
  });
  test("Has the correct default DESC listing", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    expect(res.body[0].name).toBe("language-cpp");
  });
  test("Sets ASC listing correctly", async () => {
    const res = await request(app)
      .get("/api/packages/search?q=language")
      .query({ direction: "asc" });
    expect(res.body[0].name).toBe("language-css");
  });
  test("Sets ASC listing correctly with internal param", async () => {
    const res = await request(app)
      .get("/api/packages/search?q=language")
      .query({ order: "asc" });
    expect(res.body[0].name).toBe("language-css");
  });
  test("Has the correct order listing by stars", async () => {
    const res = await request(app)
      .get("/api/packages/search?q=language")
      .query({ sort: "start" });
    expect(res.body[0].name).toBe("language-cpp");
  });
  test("Ignores invalid 'direction'", async () => {
    const res = await request(app)
      .get("/api/packages/search?q=language")
      .query({ order: "this-should-not-work" });
    expect(res.body[0].name).toBe("language-cpp");
  });
});

describe("GET /api/packages/:packageName", () => {
  test("Valid package, gives correct object", async () => {
    const res = await request(app).get("/api/packages/language-css");
    expect(res.body.name).toBe("language-css");
  });
  test("Valid Mix-caps Package, gives correct object", async () => {
    const res = await request(app).get("/api/packages/LanguAge-CSs");
    expect(res.body.name).toBe("language-css");
  });
  test("Valid package contains valid data", async () => {
    const res = await request(app).get("/api/packages/language-css");
    // PostgreSQL numeric types are not fully compatible with js Number type
    expect(`${res.body.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
    expect(`${res.body.downloads}`.match(/^\d+$/) === null).toBeFalsy();
    expect(typeof res.body.releases.latest === "string").toBeTruthy();
    for (const v of Object.keys(res.body.versions)) {
      expect(typeof res.body.versions[v].license === "string").toBeTruthy();
      expect(
        typeof res.body.versions[v].dist.tarball === "string"
      ).toBeTruthy();
    }
  });
  test("Valid package, does not return sensible data", async () => {
    const res = await request(app).get("/api/packages/language-css");
    expect(res.body.pointer === undefined).toBeTruthy();
    for (const v of Object.keys(res.body.versions)) {
      expect(res.body.versions[v].id === undefined).toBeTruthy();
      expect(res.body.versions[v].package === undefined).toBeTruthy();
    }
  });
  test("Valid package, gives success status code", async () => {
    const res = await request(app).get("/api/packages/language-css");
    expect(res).toHaveHTTPCode(200);
  });
  test("Invalid Package, gives 'Not Found'", async () => {
    const res = await request(app).get("/api/packages/invalid-package");
    expect(res.body.message).toBe("Not Found");
  });
  test("Invalid package, gives not found status code", async () => {
    const res = await request(app).get("/api/packages/invalid-package");
    expect(res).toHaveHTTPCode(404);
  });
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

describe("GET /api/packages/:packageName/stargazers", () => {
  test("Returns 404 with Bad Package", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/stargazers"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with Bad Packages", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/stargazers"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 200 with Valid Packages", async () => {
    const res = await request(app).get("/api/packages/language-css/stargazers");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns an Array with Valid Package", async () => {
    const res = await request(app).get("/api/packages/language-css/stargazers");
    expect(res.body).toBeArray();
  });
  test("Returns a Non Empty Array", async () => {
    const res = await request(app).get("/api/packages/language-css/stargazers");
    expect(res.body.length).toBeGreaterThan(0);
  });
  test("Returns Array, containing Objects with login and string", async () => {
    const res = await request(app).get("/api/packages/language-css/stargazers");
    expect(res.body[0].login).toBeTruthy();
    expect(typeof res.body[0].login === "string").toBeTruthy();
  });
});

describe("POST /api/packages/:packageName/versions", () => {
  test("Returns 404 with Bad Package", async () => {
    const res = await request(app).post(
      "/api/packages/language-golang/versions"
    );
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with No Auth", async () => {
    const res = await request(app).post(
      "/api/packages/language-golang/versions"
    );
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test.todo("Write all tests on this endpoint");
});

describe("GET /api/packages/:packageName/versions/:versionName", () => {
  test("Returns 404 with Bad Package", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/versions/1.0.0"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with Bad Package", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/versions/1.0.0"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 404 with Valid Package - Invalid Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/1.0.0"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with Valid Package = Invalid Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/1.0.0"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 404 with Valid Package - Invalid Formated Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/ThisIsNotAVersion"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with Valid Package - Invalid Formatted Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/ThisIsNotAVersion"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 200 with Valid Params", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7"
    );
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Valid Data on Expected Package Name with Valid Params", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7"
    );
    expect(res.body.name).toEqual("language-css");
    expect(typeof res.body.dist.tarball === "string").toBeTruthy();
  });
  test("Does Not Return Sensible Data on Expected Package Name with Valid Params", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7"
    );
    expect(res.body.id === undefined).toBeTruthy();
    expect(res.body.package === undefined).toBeTruthy();
    expect(res.body.sha === undefined).toBeTruthy();
  });
});

describe("DELETE /api/packages/:packageName/versions/:versionName", () => {
  test.todo("Finish these tests");
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

describe("GET /api/packages/:packageName/versions/:versionName/tarball", () => {
  test("Returns 404 with Invalid Package", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/versions/1.0.0/tarball"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found with Invalid Package", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/versions/1.0.0/tarball"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 404 with Valid Package, Invalid Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/1.0.0/tarball"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found with Valid Package, Invalid Versions", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/1.0.0/tarball"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 302 with Valid Package, Valid Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7/tarball"
    );
    expect(res).toHaveHTTPCode(302);
  });
  test("Returns Redirect True with Valid Package, Valid Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7/tarball"
    );
    expect(res.redirect).toBeTruthy();
  });
  test("Returns Expected Redirect URL", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7/tarball"
    );
    expect(res.headers.location).toEqual(
      "https://github.com/pulsar-edit/language-css"
    );
  });
});

describe("POST /api/packages/:packageName/versions/:versionName/events/uninstall", () => {
  test.todo("Write all of these");
  test("Returns 401 with No Auth", async () => {
    const res = await request(app).post(
      "/api/packages/language-css/versions/0.45.7/events/uninstall"
    );
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with No Auth", async () => {
    const res = await request(app).post(
      "/api/packages/langauge-css/versions/0.45.7/events/uninstall"
    );
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Bad Auth", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with No Auth", async () => {
    const res = await request(app)
      .post("/api/packages/langauge-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 404 with Bad Package", async () => {
    const res = await request(app)
      .post("/api/packages/language-golang/versions/1.0.0/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with Bad Package", async () => {
    const res = await request(app)
      .post("/api/packages/language-golang/versions/1.0.0/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.notFound);
  });
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
  test("Properly decrements the download count", async () => {
    const orig = await request(app).get("/api/packages/language-css");
    const res = await request(app)
      .post("/api/packages/language-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "valid-token");
    const after = await request(app).get("/api/packages/language-css");
    expect(parseInt(orig.body.downloads, 10)).toBeGreaterThan(
      parseInt(after.body.downloads, 10)
    );
  });
});

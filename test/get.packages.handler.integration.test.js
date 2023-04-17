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
    expect(parseInt(res.body[0].downloads, 10)).toBeLessThan(parseInt(res.body[1].downloads, 10));
  });
  test("Sets ASC listing correctly with internal param", async () => {
    const res = await request(app)
      .get("/api/packages/search?q=language")
      .query({ order: "asc" });
    expect(parseInt(res.body[0].downloads, 10)).toBeLessThan(parseInt(res.body[1].downloads, 10));
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

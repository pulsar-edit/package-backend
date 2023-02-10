const request = require("supertest");
const app = require("../src/main.js");

describe("GET /api/themes/featured", () => {
  test("Returns Successful Status Code", async () => {
    const res = await request(app).get("/api/themes/featured");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Array", async () => {
    const res = await request(app).get("/api/themes/featured");
    expect(res.body).toBeArray();
  });
});

describe("GET /api/themes", () => {
  test("Returns Successful Status Code", async () => {
    const res = await request(app).get("/api/themes");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns a Non Empty Array", async () => {
    const res = await request(app).get("/api/themes");
    expect(res.body).toBeArray();
    expect(res.body.length).toBeGreaterThan(0);
  });
  test("Should respond with an array containing valid data", async () => {
    const res = await request(app).get("/api/themes");
    for (const p of res.body) {
      expect(typeof p.name === "string").toBeTruthy();
      // PostgreSQL numeric types are not fully compatible with js Number type
      expect(`${p.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
      expect(`${p.downloads}`.match(/^\d+$/) === null).toBeFalsy();
      expect(typeof p.releases.latest === "string").toBeTruthy();
    }
  });
  test("Should respond with an array not containing sensible data", async () => {
    const res = await request(app).get("/api/themes");
    for (const p of res.body) {
      expect(p.pointer === undefined).toBeTruthy();
    }
  });
  test("Should respond with the expected headers", async () => {
    const res = await request(app).get("/api/themes");
    expect(res.headers["link"].length).toBeGreaterThan(0);
    expect(res.headers["query-total"].match(/^\d+$/) === null).toBeFalsy();
    expect(res.headers["query-limit"].match(/^\d+$/) === null).toBeFalsy();
  });
  test("Should 404 on invalid Method", async () => {
    const res = await request(app).patch("/api/themes");
    expect(res).toHaveHTTPCode(404);
  });
});

describe("GET /api/themes/search", () => {
  test("Valid Search Returns a Non Empty Array", async () => {
    const res = await request(app).get("/api/themes/search?q=syntax");
    expect(res.body).toBeArray();
    expect(res.body.length).toBeGreaterThan(0);
  });
  test("Valid Search Returns Success Status Code", async () => {
    const res = await request(app).get("/api/themes/search?q=syntax");
    expect(res).toHaveHTTPCode(200);
  });
  test("Valid Search does not Return Sensitive Data", async () => {
    const res = await request(app).get("/api/themes/search?q=syntax");
    for (const p of res.body) {
      expect(p.pointer === undefined).toBeTruthy();
    }
  });
  test("Valid Search Returns Valid Data", async () => {
    const res = await request(app).get("/api/themes/search?q=syntax");
    for (const p of res.body) {
      expect(typeof p.name === "string").toBeTruthy();
      expect(`${p.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
      expect(`${p.downloads}`.match(/^\d+$/) === null).toBeFalsy();
      expect(typeof p.releases.latest === "string").toBeTruthy();
    }
  });
  test("Valid Search Returns Expected Headers", async () => {
    const res = await request(app).get("/api/themes/search?q=syntax");
    expect(res.headers["link"].length).toBeGreaterThan(0);
    expect(res.headers["query-total"].match(/^\d+$/) === null).toBeFalsy();
    expect(res.headers["query-limit"].match(/^\d+$/) === null).toBeFalsy();
  });
  test("Has the correct default DESC listing", async () => {
    const res = await request(app).get("/api/themes/search?q=material");
    expect(res.body[0].name).toBe("atom-material-ui");
  });
  test("Sets ASC listing correctly", async () => {
    const res = await request(app)
      .get("/api/themes/search?q=material")
      .query({ direction: "asc" });
    expect(res.body[0].name).toBe("atom-material-syntax");
  });
  test("Invalid Search Returns Array", async () => {
    const res = await request(app).get("/api/themes/search?q=not-one-match");
    expect(res.body).toBeArray();
  });
  test("Invalid Search Returns Empty Array", async () => {
    const res = await request(app).get("/api/themes/search?q=not-one-match");
    expect(res.body.length).toBeLessThan(1);
  });
});

describe("Ensure Themes is passed to each endpoint Properly", () => {
  test("GET /api/themes/:packageName", async () => {
    const res = await request(app).get("/api/themes/language-css");
    expect(res).toHaveHTTPCode(200);
    expect(res.body.name).toBe("language-css");
    expect(res.body.pointer === undefined).toBeTruthy();
  });
  test("GET /api/themes/:packageName/stargazers", async () => {
    const res = await request(app).get("/api/themes/language-css/stargazers");
    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].login).toBeTruthy();
    expect(typeof res.body[0].login === "string").toBeTruthy();
  });
  test("GET /api/themes/:packageName/versions/:versionName", async () => {
    const res = await request(app).get(
      "/api/themes/language-css/versions/0.45.7"
    );
    expect(res).toHaveHTTPCode(200);
    expect(res.body.name).toEqual("language-css");
    expect(typeof res.body.dist.tarball === "string").toBeTruthy();
    expect(res.body.id === undefined).toBeTruthy();
    expect(res.body.package === undefined).toBeTruthy();
    expect(res.body.sha === undefined).toBeTruthy();
  });
  test("GET /api/themes/:pakageName/versions/:versionName/tarball", async () => {
    const res = await request(app).get(
      "/api/themes/language-css/versions/0.45.7/tarball"
    );
    expect(res).toHaveHTTPCode(302);
    expect(res.redirect).toBeTruthy();
  });
});

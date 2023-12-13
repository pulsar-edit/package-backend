const request = require("supertest");
const app = require("../../src/setupEndpoints.js");

describe("Ensure Options Method Returns as Expected", () => {
  const rateLimitHeaderCheck = (res) => {
    expect(res.headers["x-ratelimit-limit"]).toBeDefined();
    expect(res.headers["x-ratelimit-limit"]).toBeDefined();
    expect(res.headers["x-ratelimit-remaining"]).toBeDefined();
    expect(res.headers["x-ratelimit-reset"]).toBeDefined();
    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
    expect(res.headers["ratelimit-reset"]).toBeDefined();
  };

  test("Root Return", async () => {
    const res = await request(app).options("/");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/login", async () => {
    const res = await request(app).options("/api/login");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/oauth", async () => {
    const res = await request(app).options("/api/oauth");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/pat", async () => {
    const res = await request(app).options("/api/pat");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/:packType", async () => {
    const res = await request(app).options("/api/packages");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("POST, GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/:packType/featured", async () => {
    const res = await request(app).options("/api/packages/featured");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/:packType/search", async () => {
    const res = await request(app).options("/api/packages/search");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/:packType/:packageName", async () => {
    const res = await request(app).options("/api/packages/language-css");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("DELETE, GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/:packType/:packageName/star", async () => {
    const res = await request(app).options("/api/packages/language-css/star");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("DELETE, POST");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/:packType/:packageName/stargazers", async () => {
    const res = await request(app).options(
      "/api/packages/language-css/stargazers"
    );
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/:packType/:packageName/versions", async () => {
    const res = await request(app).options(
      "/api/packages/language-css/versions"
    );
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("POST");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/:packType/:packageName/versions/:versionName", async () => {
    const res = await request(app).options(
      "/api/packages/langauge-css/versions/1.0.0"
    );
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET, DELETE");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/:packType/:packageName/versions/:versionName/tarball", async () => {
    const res = await request(app).options(
      "/api/packages/language-css/versions/1.0.0/tarball"
    );
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/:packType/:packageName/versions/:versionName/events/uninstall", async () => {
    const res = await request(app).options(
      "/api/packages/language-css/versions/1.0.0/events/uninstall"
    );
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("POST");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/users/:login/stars", async () => {
    const res = await request(app).options("/api/users/confused-Techie/stars");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/users", async () => {
    const res = await request(app).options("/api/users");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["access-control-allow-methods"]).toEqual("GET");
    expect(res.headers["access-control-allow-headers"]).toEqual(
      "Content-Type, Authorization, Access-Control-Allow-Credentials"
    );
    expect(res.headers["access-control-allow-origin"]).toEqual(
      "https://web.pulsar-edit.dev"
    );
    expect(res.headers["access-control-allow-credentials"]).toEqual("true");
    rateLimitHeaderCheck(res);
  });
  test("/api/users/:login", async () => {
    const res = await request(app).options("/api/users/confused-Techie");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/stars", async () => {
    const res = await request(app).options("/api/stars");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
  test("/api/updates", async () => {
    const res = await request(app).options("/api/updates");
    expect(res).toHaveHTTPCode(204);
    expect(res.headers.allow).toEqual("GET");
    expect(res.headers["x-content-type-options"]).toEqual("nosniff");
    rateLimitHeaderCheck(res);
  });
});

const { URL } = require("node:url");
const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");

describe("GET /api/login", () => {
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

  test("Returns proper redirect", async () => {
    const res = await supertest(app).get("/api/login");

    expect(res).toHaveHTTPCode(302);
    expect(res.headers["location"]).toBeDefined();

    const redirect = new URL(res.headers["location"]);

    expect(redirect.host).toBe("github.com");
    expect(redirect.pathname).toBe("/login/oauth/authorize");
    expect(redirect.searchParams.get("scope")).toBe("public_repo read:org");
    expect(redirect.searchParams.get("state")).toBeDefined();
    expect(redirect.searchParams.get("client_id")).toBeDefined();
    expect(redirect.searchParams.get("redirect_uri")).toBeDefined();
  });
});

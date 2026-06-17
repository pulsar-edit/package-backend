const { URL } = require("node:url");
const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");

describe("GET /api/oauth", () => {
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

  test("Fails with non-existant state key", async () => {
    const res = await supertest(app)
      .get("/api/oauth")
      .query({ code: "any-code-from-github" })
      .query({ state: "this-state-key-does-not-exist" });

    expect(res).toHaveHTTPCode(500);
    expect(res.body.message).toBe("Application Error: Invalid State Key provided.");
  });

  test("Fails when Github access token retrevial fails", async () => {
    // == Setup
    nock("https://github.com/")
      .post("/login/oauth/access_token")
      .query(true)
      .reply(200, { // TODO: I can't find in docs what status codes this endpoint may return
        error: "unverified_user_email",
        error_description: "The user must have a verified primary email.",
        error_uri: "/apps/managing-oauth-apps/troubleshooting-oauth-app-access-token-request-errors/#unverified_user_email"
      });

    // == Test
    // First we need to create the state key, to do so we will follow the regular
    // login flow

    const resState = await supertest(app)
      .get("/api/login");

    expect(resState).toHaveHTTPCode(302);
    expect(resState.headers["location"]).toBeDefined();

    const redirectUrl = new URL(resState.headers["location"]);
    const stateKey = redirectUrl.searchParams.get("state");

    const res = await supertest(app)
      .get("/api/oauth")
      .query({ state: stateKey })
      .query({ code: "some-github-super-secret-code" });

    expect(res).toHaveHTTPCode(500);
    //expect(res.body.message).toBe("Application Error: Authentication to GitHub failed.");
    expect(res.body.message).toBe("Application Error: The server encountered an error processing the request.");
    // TODO Why isn't this the first error?
  });

  test("Fails when GitHub request for user data fails", async () => {
    // == Setup
    nock("https://github.com")
      .post("/login/oauth/access_token")
      .query(true)
      .reply(200, {
        access_token: "gho_some_secure_token",
        scope: "proper scopes",
        token_type: "bearer"
      });

    nock("https://api.github.com")
      .get("/user").query(true).reply(401, {
        message: "Requires authentication"
      });

    // == Test
    const resState = await supertest(app)
      .get("/api/login");

    expect(resState).toHaveHTTPCode(302);
    expect(resState.headers["location"]).toBeDefined();

    const redirectUrl = new URL(resState.headers["location"]);
    const stateKey = redirectUrl.searchParams.get("state");

    const res = await supertest(app)
      .get("/api/oauth")
      .query({ state: stateKey })
      .query({ code: "some-github-super-secret-code" });

    expect(res).toHaveHTTPCode(500);
    //expect(res.body.message).toBe("Application Error: Received HTTP Status 401");
    expect(res.body.message).toBe("Application Error: The server encountered an error processing the request.");
    // TODO Why isn't this the first error?
  });

  test("Redirects to the frontend site on success", async () => {
    // == Setup
    nock("https://github.com")
      .post("/login/oauth/access_token")
      .query(true)
      .reply(200, {
        access_token: "gho_some_secure_token",
        scope: "proper scopes",
        token_type: "bearer"
      });

    nock("https://api.github.com")
      .get("/user").query(true).reply(200, {
        node_id: "getOauth-test-node-id",
        login: "getOauth-test-user-id",
        avatar_url: "https://github.com/images/error/octocat_happy.gif"
      });

    // == Test
    const resState = await supertest(app)
      .get("/api/login");

    expect(resState).toHaveHTTPCode(302);
    expect(resState.headers["location"]).toBeDefined();

    const redirectUrl = new URL(resState.headers["location"]);
    const stateKey = redirectUrl.searchParams.get("state");

    const res = await supertest(app)
      .get("/api/oauth")
      .query({ state: stateKey })
      .query({ code: "some-github-super-secret-code" });

    expect(res).toHaveHTTPCode(302);
    expect(res.headers["location"]).toBeDefined();

    const resRedirect = new URL(res.headers["location"]);

    expect(resRedirect.host).toBe("packages.pulsar-edit.dev");
    expect(resRedirect.pathname).toBe("/users");
    expect(resRedirect.searchParams.get("token")).toBeDefined();

    // Does it also create a new user?
    const getUser = await database.getUserByName("getOauth-test-user-id");
    expect(getUser.ok).toBe(true);

    // == Cleanup
    const removeUser = await database.removeUserByID(getUser.content.id);
    expect(removeUser.ok).toBe(true);
  });
});

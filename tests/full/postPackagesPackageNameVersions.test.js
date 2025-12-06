const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");

describe("POST /api/packages/:packageName/versions", () => {
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

  test("Fails with bad auth", async () => {
    // Return bad auth from github
    nock("https://api.github.com/").get("/user").reply(401, {
      message: "Requires authentication"
    });

    const res = await supertest(app)
      .post("/api/packages/any-package-name-will-do/versions")
      .set({ Authorization: "any-token-will-do" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toBe("Unauthorized: User Authentication Failed when attempting to publish package version!");
  });

  test.todo("Write the tests that are now possible!");
});

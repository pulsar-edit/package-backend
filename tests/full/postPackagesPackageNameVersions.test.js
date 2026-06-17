const supertest = require("supertest");
const nock = require("nock");
const app = require("../../src/setupEndpoints.js");

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
    // == Setup
    nock("https://api.github.com/").get("/user").reply(401, {
      message: "Requires authentication",
    });

    // == Test
    const res = await supertest(app)
      .post("/api/packages/any-package-will-do/versions")
      .set({ Authorization: "invalid" });

    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(
      "Unauthorized: User Authentication Failed when attempting to publish package version!"
    );
  });

  test.todo("Write the tests that are now possible!!");
});

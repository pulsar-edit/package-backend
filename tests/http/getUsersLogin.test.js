const endpoint = require("../../src/controllers/getUsersLogin.js");
const database = require("../../src/database/_export.js");
const context = require("../../src/context.js");
const userObject = require("../models/userObjectPublic.js");

describe("Behaves as expected", () => {
  test("Returns bad SSO on failure", async () => {
    const userName = "our-test-user";

    const res = await endpoint.logic({ login: userName }, context);

    expect(res.ok).toBe(false);
    expect(res.content.short).toBe("not_found");
  });

  test("Returns Correct SSO on Success", async () => {
    const userObj = userObject.example;
    userObj.username = "our-test-user";

    // First we add a new fake user
    await database.insertNewUser(userObj.username, "id", userObj.avatar);

    const res = await endpoint.logic(
      {
        login: userObj.username,
      },
      context
    );

    expect(res.ok).toBe(true);
    // First make sure the user object matches expectations broadly, then specifically
    expect(res.content.username).toBe(userObj.username);
    expect(res.content.avatar).toBe(userObj.avatar);
    expect(res).toMatchEndpointSuccessObject(endpoint);
    // TODO delete once there's a method to do so
  });
});

describe("HTTP Handling works", () => {
  test("Calls the right function", async () => {
    const request = require("supertest");
    const app = require("../../src/setupEndpoints.js");

    const spy = jest.spyOn(endpoint, "logic");

    const res = await request(app).get("/api/users/confused-Techie");

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });
});

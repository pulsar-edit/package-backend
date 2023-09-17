const endpoint = require("../../src/controllers/getUsersLogin.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");
const userObject = require("../models/userObjectPublic.js");
const { matchesSuccessObject } = require("../helpers/utils.helper.jest.js");

describe("Behaves as expected", () => {

  test("Calls the correct db function", async () => {
    const localContext = context;
    const spy = jest.spyOn(localContext.database, "getUserByName");

    const res = await endpoint.logic({}, localContext);

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });

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
        login: userObj.username
      },
      context
    );

    expect(res.ok).toBe(true);
    // First make sure the user object matches expectations broadly, then specifically
    expect(res.content).toMatchObject(userObject.test);
    expect(res.content.username).toBe(userObj.username);
    expect(res.content.avatar).toBe(userObj.avatar);

    // We also want to ensure that the object matches what the docs say it should
    const match = matchesSuccessObject(res, endpoint);
    expect(match).toBeTruthy();
    // TODO delete once there's a method to do so
  });
});

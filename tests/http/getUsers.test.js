const endpoint = require("../../src/controllers/getUsers.js");
const database = require("../../src/database.js");
const context = require("../../src/context.js");
const userObject = require("../models/userObjectPrivate.js");

describe("Behaves as expected", () => {

  test("Calls the correct function", async () => {
    const localContext = context;
    localContext.auth = {
      verifyAuth: () => { return { ok: false }; }
    };

    const spy = jest.spyOn(localContext.auth, "verifyAuth");

    await endpoint.logic({}, localContext);

    expect(spy).toBeCalledTimes(1);

    spy.mockClear();
  });

  test("Returns bad SSO on failure", async () => {
    const localContext = context;
    localContext.auth = {
      verifyAuth: () => { return { ok: false, content: "A test fail" }; }
    };

    const sso = await endpoint.logic({}, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.content.content).toBe("A test fail");
  });

  test("Returns good SSO on success", async () => {
    const testUser = userObject.example;
    testUser.username = "test-user";

    const localContext = context;
    localContext.auth = {
      verifyAuth: () => {
        return {
          ok: true,
          content: testUser
        };
      }
    };

    const sso = await endpoint.logic({}, localContext);

    expect(sso.ok).toBe(true);
    expect(sso.content).toMatchObject(testUser);
    expect(sso).toMatchEndpointSuccessObject(endpoint);
  });
});

describe("Extra functions behave", () => {
  test("preLogic adds headers as needed", async () => {
    const headerObj = {};
    const res = {
      header: (name, val) => { headerObj[name] = val; }
    };

    await endpoint.preLogic({}, res, {});

    const expected = {
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Access-Control-Allow-Credentials",
      "Access-Control-Allow-Origin": "https://web.pulsar-edit.dev",
      "Access-Control-Allow-Credentials": true
    };

    expect(headerObj).toMatchObject(expected);
  });

  test("postLogic adds headers as needed", async () => {
    let headerObj = {};

    const res = {
      set: (obj) => { headerObj = obj; }
    };

    await endpoint.postLogic({}, res, {});

    const expected = {
      "Access-Control-Allow-Credentials": true
    };

    expect(headerObj).toMatchObject(expected);
  });
});

const common = require("../../src/handlers/common_handler.js");
const { Res, Req } = require("./express_fakes.js");

describe("Modifies res when invoking 'missingAuthJSON'", () => {

  let EXPECTED_MESSAGE = "Requires authentication. Please update your token if you haven't done so recently.";
  let EXPECTED_STATUS = 401;

  test("via Bad Auth", async () => {
    let res = new Res();
    let req = new Req();

    await common.authFail(req, res, { short: "Bad Auth" }, 0);

    expect(res.statusCode).toBe(EXPECTED_STATUS);
    expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
  });

  test("via Auth Fail", async () => {
    let res = new Res();
    let req = new Req();

    await common.authFail(req, res, { short: "Auth Fail" }, 0);

    expect(res.statusCode).toBe(EXPECTED_STATUS);
    expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
  });

  test("via No Repo Access", async () => {
    let res = new Res();
    let req = new Req();

    await common.authFail(req, res, { short: "No Repo Access" }, 0);

    expect(res.statusCode).toBe(EXPECTED_STATUS);
    expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
  });
});

describe("Modifies res when invoking serverError", () => {

  let EXPECTED_STATUS = 500;
  let EXPECTED_MESSAGE = "Application Error";

  test("via DEFAULT", async () => {
    let res = new Res();
    let req = new Req();

    await common.authFail(req, res, { short: "NOT_A_VALID_OPTION" }, 0);

    expect(res.statusCode).toBe(EXPECTED_STATUS);
    expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
  });
});

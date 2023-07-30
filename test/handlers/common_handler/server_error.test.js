const common = require("../../src/handlers/common_handler.js");
const { Res, Req } = require("./express_fakes.js");

const EXPECTED_MESSAGE = "Application Error";
const EXPECTED_STATUS = 500;

test("Modifies res when invoked directly", async () => {
  let res = new Res();
  let req = new Req();

  await common.serverError(req, res);

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

test("Modifies res when invoked indirectly - Server Error", async () => {
  let res = new Res();
  let req = new Req();

  await common.handleError(req, res, {
    short: "Server Error"
  });

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

test("Modifies res when invoked indirectly - File Not Found", async () => {
  let res = new Res();
  let req = new Req();

  await common.handleError(req, res, {
    short: "File Not Found"
  });

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

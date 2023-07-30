const common = require("../../src/handlers/common_handler.js");
const { Res, Req } = require("./express_fakes.js");

const EXPECTED_MESSAGE = "While under development this feature is not supported.";
const EXPECTED_STATUS = 501;

test("Modifies res when invoked directly", async () => {
  let res = new Res();
  let req = new Req();

  await common.notSupported(req, res);

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

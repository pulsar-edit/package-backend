const common = require("../../../src/handlers/common_handler.js");
const { Res, Req } = require("./express_fakes.js");

const EXPECTED_MESSAGE = "Requires authentication. Please update your token if you haven't done so recently.";
const EXPECTED_STATUS = 401;

test("Modifies res when invoked indirectly", async () => {
  let res = new Res();
  let req = new Req();

  await common.handleError(req, res, {
    short: "Bad Auth"
  });

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

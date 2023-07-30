const common = require("../../src/handlers/common_handler.js");
const { Res, Req } = require("./express_fakes.js");

const EXPECTED_MESSAGE = "This is a standin for the proper site wide 404 page.";
const EXPECTED_STATUS = 404;

test("Modifies res when invoked directly", async () => {
  let res = new Res();
  let req = new Req();

  await common.siteWideNotFound(req, res);

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

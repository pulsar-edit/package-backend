const common = require("../../../src/handlers/common_handler.js");
const { Res, Req } = require("./express_fakes.js");

const EXPECTED_MESSAGE = "Not Found";
const EXPECTED_STATUS = 404;

test("Modifies res when invoked directly", async () => {
  let res = new Res();
  let req = new Req();

  await common.notFound(req, res);

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

test("Modifies res when invoked indirectly", async () => {
  let res = new Res();
  let req = new Req();

  await common.handleError(req, res, {
    short: "Not Found"
  });

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

const common = require("../../src/handlers/common_handler.js");
const { Res, Req } = require("./express_fakes.js");

const EXPECTED_MESSAGE = "A Package by that name already exists.";
const EXPECTED_STATUS = 409;

test("Modifies res when invoked directly", async () => {
  let res = new Res();
  let req = new Req();

  await common.packageExists(req, res);

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

test("Modifies res when invoked indirectly", async () => {
  let res = new Res();
  let req = new Req();

  await common.handleError(req, res, {
    short: "Package Exists"
  });

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

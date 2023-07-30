const common = require("../../../src/handlers/common_handler.js");
const { Res, Req } = require("./express_fakes.js");

const EXPECTED_MESSAGE = "The package.json at owner/repo isn't valid.";
const EXPECTED_STATUS = 400;

test("Modifies res when invoked directly", async () => {
  let res = new Res();
  let req = new Req();

  await common.badPackageJSON(req, res);

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

test("Modifies res when invoked indirectly", async () => {
  let res = new Res();
  let req = new Req();

  await common.handleError(req, res, {
    short: "Bad Package"
  });

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

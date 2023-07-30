const common = require("../../src/handlers/common_handler.js");
const { Res, Req } = require("./express_fakes.js");

const EXPECTED_MESSAGE = "That repo does not exist, isn't an atom package, or atombot does not have access.";
const EXPECTED_STATUS = 400;

test("Modifies res when invoked directly", async () => {
  let res = new Res();
  let req = new Req();

  await common.badRepoJSON(req, res);

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

test("Modifies res when invoked indirectly", async () => {
  let res = new Res();
  let req = new Req();

  await common.handleError(req, res, {
    short: "Bad Repo"
  });

  expect(res.statusCode).toBe(EXPECTED_STATUS);
  expect(res.JSONObj.message).toBe(EXPECTED_MESSAGE);
});

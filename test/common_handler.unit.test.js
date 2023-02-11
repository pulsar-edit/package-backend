const common = require("../src/handlers/common_handler.js");

// This is an impersonator of the ExpressJS Response Object.
// Whose goal is to very simply test the exact features we care about. Without
// overhead or bloat.
class NewRes {
  constructor() {
    this.statusCode = 0;
    this.JSONObj = "";
  }
  json(obj) {
    this.JSONObj = obj;
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
}

class NewReq {
  constructor() {
    this.ip = "0.0.0.0";
    this.method = "TEST";
    this.url = "/dev";
    this.protocol = "DEV";
    this.start = Date.now();
  }
}

test("AuthFail Modifies 'Server Error' HTTP Status and Body", async () => {
  let res = new NewRes();
  let req = new NewReq();
  let user = {
    ok: false,
    content: "DEV",
    short: "Server Error",
  };

  await common.authFail(req, res, user);

  expect(res.statusCode).toBe(500);
  expect(res.JSONObj).toStrictEqual({ message: "Application Error" });
});

test("AuthFail Modifies 'Bad Auth' HTTP Status and Body", async () => {
  let res = new NewRes();
  let req = new NewReq();
  let user = {
    ok: false,
    content: "DEV",
    short: "Bad Auth",
  };

  await common.authFail(req, res, user);

  expect(res.statusCode).toBe(401);
  expect(res.JSONObj).toStrictEqual({
    message:
      "Requires authentication. Please update your token if you haven't done so recently.",
  });
});

test("ServerError Modifies HTTP Status and Body", async () => {
  let res = new NewRes();
  let req = new NewReq();
  let err = "DEV Error";

  await common.serverError(req, res, err);

  expect(res.statusCode).toBe(500);
  expect(res.JSONObj).toStrictEqual({ message: "Application Error" });
});

test("NotFound Modifies HTTP Status and body", async () => {
  let res = new NewRes();
  let req = new NewReq();

  await common.notFound(req, res);

  expect(res.statusCode).toBe(404);
  expect(res.JSONObj).toStrictEqual({ message: "Not Found" });
});

test("NotSupported Modifies HTTP Status and Body", async () => {
  let res = new NewRes();
  let req = new NewReq();

  await common.notSupported(req, res);

  expect(res.statusCode).toBe(501);
  expect(res.JSONObj).toStrictEqual({
    message: "While under development this feature is not supported.",
  });
});

test("SiteWideNotFound Modifies HTTP Status and Body", async () => {
  let res = new NewRes();
  let req = new NewReq();

  await common.siteWideNotFound(req, res);

  expect(res.statusCode).toBe(404);
  expect(res.JSONObj).toStrictEqual({
    message: "This is a standin for the proper site wide 404 page.",
  });
});

test("BadRepoJSON Modifies HTTP Status", async () => {
  let res = new NewRes();
  let req = new NewReq();

  await common.badRepoJSON(req, res);

  expect(res.statusCode).toBe(400);
});

test("BadRepoJSON Modifies JSON", async () => {
  let res = new NewRes();
  let req = new NewReq();

  await common.badRepoJSON(req, res);

  expect(res.JSONObj.message).toBe(
    "That repo does not exist, isn't an atom package, or atombot does not have access."
  );
});

test("BadPackageJSON Modifies HTTP Status and Body", async () => {
  let res = new NewRes();
  let req = new NewReq();

  await common.badPackageJSON(req, res);

  expect(res.statusCode).toBe(400);
  expect(res.JSONObj.message).toBe(
    "The package.json at owner/repo isn't valid."
  );
});

test("PackageExists Modifies HTTP Status and Body", async () => {
  let res = new NewRes();
  let req = new NewReq();

  await common.packageExists(req, res);

  expect(res.statusCode).toBe(409);
  expect(res.JSONObj.message).toBe("A Package by that name already exists.");
});

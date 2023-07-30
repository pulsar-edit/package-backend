const common = require("../../../src/handlers/common_handler.js");
const { Res, Req } = require("./express_fakes.js");

describe("Modifies res as needed", () => {

  test("via Not Found", async () => {
    let res = new Res();
    let req = new Req();

    await common.handleDetailedError(req, res, {
      short: "Not Found",
      content: "The Details"
    });

    expect(res.statusCode).toBe(404);
    expect(res.JSONObj.message).toBe("Not Found");
    expect(res.JSONObj.details).toBe("The Details");
  });

  test("via Bad Repo", async () => {
    let res = new Res();
    let req = new Req();

    await common.handleDetailedError(req, res, {
      short: "Bad Repo",
      content: "The Details"
    });

    expect(res.statusCode).toBe(400);
    expect(res.JSONObj.message).toBe("That repo does not exists, isn't a Pulsar package, or pulsarbot does not have access.");
    expect(res.JSONObj.details).toBe("The Details");
  });

  test("via Bad Package", async () => {
    let res = new Res();
    let req = new Req();

    await common.handleDetailedError(req, res, {
      short: "Bad Package",
      content: "The Details"
    });

    expect(res.statusCode).toBe(400);
    expect(res.JSONObj.message).toBe("The package.json at owner/repo isn't valid.");
    expect(res.JSONObj.details).toBe("The Details");
  });

  test("via No Repo Access", async () => {
    let res = new Res();
    let req = new Req();

    await common.handleDetailedError(req, res, {
      short: "No Repo Access",
      content: "The Details"
    });

    expect(res.statusCode).toBe(401);
    expect(res.JSONObj.message).toBe("Requires authentication. Please update your token if you haven't done so recently.");
    expect(res.JSONObj.details).toBe("The Details");
  });

  test("via Bad Auth", async () => {
    let res = new Res();
    let req = new Req();

    await common.handleDetailedError(req, res, {
      short: "Bad Auth",
      content: "The Details"
    });

    expect(res.statusCode).toBe(401);
    expect(res.JSONObj.message).toBe("Requires authentication. Please update your token if you haven't done so recently.");
    expect(res.JSONObj.details).toBe("The Details");
  });

  test("via File Not Found", async () => {
    let res = new Res();
    let req = new Req();

    await common.handleDetailedError(req, res, {
      short: "File Not Found",
      content: "The Details"
    });

    expect(res.statusCode).toBe(500);
    expect(res.JSONObj.message).toBe("Application Error");
    expect(res.JSONObj.details).toBe("The Details");
  });

  test("via Server Error", async () => {
    let res = new Res();
    let req = new Req();

    await common.handleDetailedError(req, res, {
      short: "Server Error",
      content: "The Details"
    });

    expect(res.statusCode).toBe(500);
    expect(res.JSONObj.message).toBe("Application Error");
    expect(res.JSONObj.details).toBe("The Details");
  });

  test("via Invalid Argument", async () => {
    let res = new Res();
    let req = new Req();

    await common.handleDetailedError(req, res, {
      short: "Invalid_Argument_That_Doesnt_Exist",
      content: "The Details"
    });

    expect(res.statusCode).toBe(500);
    expect(res.JSONObj.message).toBe("Application Error");
    expect(res.JSONObj.details).toBe("The Details");
  });

});

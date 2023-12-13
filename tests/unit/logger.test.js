const logger = require("../../src/logger.js");

global.console.log = jest.fn();

describe("httpLog Testing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Normal HTTPLog Call", () => {
    logger.httpLog(
      {
        ip: "0.0.0.0",
        start: "0",
        method: "GET",
        url: "https://dev.com",
        protocol: "HTTP",
      },
      {
        statusCode: "200",
      }
    );
    // Attempting to expect the timing its handled, has proved to be unreliable.
    //let date = new Date();
    //let duration = Date.now() - 0;
    expect(console.log).toBeCalledTimes(1);
    //expect(console.log).toHaveBeenLastCalledWith(`HTTP:: 0.0.0.0 [${date.toISOString()}] "GET https://dev.com HTTP" 200 ${duration}ms`);
  });
});

describe("generic Logger Call", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Bad Values returns default log", () => {
    logger.generic();
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith(
      "[TRACE]:: logger.generic() Called with Missing `val`"
    );
  });
  test("Bad Level Returns Default Level", () => {
    logger.generic(undefined, "Hello World");
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("[TRACE]:: Hello World");
  });
  test("Valid Basic Values Log Correctly", () => {
    logger.generic(6, "Hello World");
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("[TRACE]:: Hello World");
  });
  test("Valid Trace Logs", () => {
    logger.generic(6, "Test");
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("[TRACE]:: Test");
  });
  test("Valid Unsupported Log Level logs nothing", () => {
    logger.generic(100, "Test");
    expect(console.log).toBeCalledTimes(0);
  });
  test("Valid Debug Log Level", () => {
    logger.generic(5, "Test");
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("[DEBUG]:: Test");
  });
  test("Valid Info Log Level", () => {
    logger.generic(4, "Test");
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("[INFO]:: Test");
  });
  test("Valid Warning Log Level", () => {
    logger.generic(3, "Test");
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("[WARNING]:: Test");
  });
  test("Valid Error Log Level", () => {
    logger.generic(2, "Test");
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("[ERROR]:: Test");
  });
  test("Valid Fatal Log Level", () => {
    logger.generic(1, "Test");
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("[FATAL]:: Test");
  });
  test("Empty Meta Type", () => {
    logger.generic(6, "Test", { type: undefined });
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("[TRACE]:: Test");
  });
  test("Empty HTTP But HTTP Type", () => {
    logger.generic(6, "Test", { type: "http", res: {}, req: {} });
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith(`[TRACE]:: Test`);
  });
});

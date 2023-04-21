const webhook = require("../src/webhook.js");
const superagent = require("superagent");
const logger = require("../src/logger.js");

jest.mock("../src/logger.js", () => {
  return {
    generic: jest.fn()
  }
});

jest.mock("superagent", () => {

  return {
    send: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis()
  }
});

describe("Publish Webhook", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Success as Expected", async () => {
    let hookSend = await webhook.alertPublishPackage(
      {
        name: "Dev Package"
      },
      {
        username: "Dev User"
      }
    );


    expect(superagent.post).toHaveBeenCalled();
    expect(superagent.send).toHaveBeenCalled();
    expect(superagent.send).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Dev User Published Dev Package to Pulsar!"
      })
    );
  });

  test("Fails if not given proper data", async () => {
    let hookSend = await webhook.alertPublishPackage(
      {
        name: "language"
      },
      {}
    );

    expect(superagent.post).not.toHaveBeenCalled();
    expect(superagent.send).not.toHaveBeenCalled();
    expect(logger.generic).toHaveBeenCalled();
    expect(logger.generic).toHaveBeenCalledWith(
      3,
      "Webhook for package language was missing required fields!"
    );

  });

});

describe("Version Webhook", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Success as Expected", async () => {
    let hookSend = await webhook.alertPublishVersion(
      {
        name: "language-css",
        metadata: {
          version: "1.0.0"
        }
      },
      {
        username: "confused-Techie"
      }
    );

    expect(superagent.post).toHaveBeenCalled();
    expect(superagent.send).toHaveBeenCalled();
    expect(superagent.send).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "confused-Techie Published version 1.0.0 of language-css to Pulsar!"
      })
    );
  });

  test("Fails if not given proper data", async () => {
    let hookSend = await webhook.alertPublishVersion(
      {
        name: "langauge-css",
        metadata: {}
      },
      {
        username: "confused-Techie"
      }
    );

    expect(superagent.post).not.toHaveBeenCalled();
    expect(superagent.send).not.toHaveBeenCalled();
    expect(logger.generic).toHaveBeenCalled();
    expect(logger.generic).toHaveBeenCalledWith(
      3,
      "Webhook for version of langauge-css was missing required fields!"
    )
  });
});

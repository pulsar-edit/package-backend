const { performance } = require("node:perf_hooks");

module.exports = class CallStack {
  constructor() {
    this.calls = {};

    this.initialize();
  }

  initialize() {
    this.addCall("init", {});
  }

  addCall(id, content) {
    this.calls[id] = {
      content: this.sanitize(content),
      time: performance.now(),
    };
  }

  // Attempts to remove any sensitive data that may be found within
  sanitize(content) {

    const badKeys = [
      "token",
      "password",
      "pass",
      "auth",
      "secret",
      "passphrase",
      "card"
    ];
    const githubTokenReg = /(?:gho_|ghp_|github_pat_|ghu_|ghs_|ghr_)/;
    const hideString = "*****";
    let outContent = {};
    let type = typeof content;

    // Since JavaScript `typeof` will assign an array as "object" as well as null
    // we will extend this typeof check to add those as different types, to ease
    // the complexity of the below switch statement
    if (type === "object") {
      if (Array.isArray(content)) {
        type = "array";
      } else if (content === null) {
        type = "null";
      }
    }

    switch(type) {
      case "object":
        for (const key in content) {
          // Match different possible keys that represent sensitive data
          if (badKeys.includes(key)) {
            outContent[key] = hideString;
          } else {
            outContent[key] = this.sanitize(content[key]);
          }
        }
        break;
      case "string":
        // Match different strings of sensitive data

        // https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github#githubs-token-formats
        if (githubTokenReg.test(content)) {
          outContent = hideString;
        } else { // More strings to test can be added here
          // String seems safe
          outContent = content;
        }
        break;
      case "array":
        outContent = [];
        for (let i = 0; i < content.length; i++) {
          outContent.push(this.sanitize(content[i]));
        }
        break;
      default:
        outContent = content;
    }

    return outContent;
  }
};

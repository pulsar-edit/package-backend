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

    const hideString = "*****";
    let outContent = {};
    let type = typeof content;

    // Since JavaScript `typeof` will assign an array as "object" as well as null
    // we will extend this typeof check to add those as different types, to ease
    // the complexity of the below switch statement
    if (Array.isArray(content)) {
      type = "array";
    }
    if (content === null) {
      type = "null";
    }

    switch(type) {
      case "object":
        for (const key in content) {
          // Match different possible keys that represent sensitive data
          switch(key) {
            case "token":
              outContent[key] = hideString;
              break;
            default:
              outContent[key] = this.sanitize(content[key]);
              break;
          }
        }
        break;
      case "string":
        // Match different strings of sensitive data

        // https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github#githubs-token-formats
        if (content.startsWith("gho_")) {
          outContent = hideString;
        } else if (content.startsWith("ghp_")) {
          outContent = hideString;
        } else if (content.startsWith("github_pat_")) {
          outContent = hideString;
        } else if (content.startsWith("ghu_")) {
          outContent = hideString;
        } else if (content.startsWith("ghs_")) {
          outContent = hideString;
        } else if (content.startsWith("ghr_")) {
          outContent = hideString;
        } else {
          // String seems safe
          outContent = content;
        }
        break;
      case "array":
        let tmpArr = [];
        for (let i = 0; i < content.length; i++) {
          tmpArr.push(this.sanitize(content[i]));
        }
        outContent = tmpArr;
        break;
      default:
        outContent = content;
    }

    return outContent;
  }
};

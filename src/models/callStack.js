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
    if (typeof content !== "object") {
      return content;
    }

    let outContent = {};

    for (const key in content) {
      switch (key) {
        case "token":
          outContent[key] = "*****";
          break;
        default:
          outContent[key] = content[key];
          break;
      }
    }

    return outContent;
  }
};

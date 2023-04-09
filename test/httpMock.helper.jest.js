/**
 * @module httpMock.helper.jest.js
 * @desc This module can help other tests create and mock API results from
 * the `vcs_providers/git.js` module as needed.
 * With support for crafting objects using an object builder pattern.
 * And encoding data into `base64` as expected on the fly.
 */

const Git = require("../src/vcs_providers/git.js");

class HTTP {
  constructor(path) {
    this.path = path ?? "";
    this.ok;
    this.status;
    this.headers;
    this.body;
    this.short;
  }

  ok(bool) {
    this.ok = bool;
    return this;
  }

  short(val) {
    this.short = val;
    return this;
  }

  status(val) {
    this.status = val;
    return this;
  }

  headers(val) {
    this.headers = val;
    return this;
  }

  body(val) {
    this.body = val;
    return this;
  }

  parse() {
    // This returns a properly constructed object.

    return {
      url: this.path,
      obj: {
        ok: this.ok,
        short: this.short,
        content: {
          status: this.status,
          headers: this.headers,
          body: this.body,
        },
      },
    };
  }
}

function base64(val) {
  // takes a value, and returns a content and encoding, similar to how GitHub does.
  let content = Buffer.from(val).toString("base64");
  return {
    content: content,
    encoding: "base64",
  };
}

const webRequestMock = (data) => {
  const tmpMock = jest
    .spyOn(Git.prototype, "_webRequestAuth")
    .mockImplementation((url, token) => {
      for (let i = 0; i < data.length; i++) {
        if (url === data[i].url) {
          return data[i].obj;
        }
      }
    });
  return tmpMock;
};

module.exports = {
  webRequestMock,
  base64,
  HTTP,
};

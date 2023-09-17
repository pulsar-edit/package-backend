// Add `expect().toMatchSchema()` to Jest, for matching against Joi Schemas

const jestJoi = require("jest-joi");

expect.extend(jestJoi.matchers);

// Add our custom extensions
expect.extend({
  // `expect().toBeArray()`
  toBeArray(value) {
    if (Array.isArray(value)) {
      return {
        pass: true,
        message: () => "",
      };
    } else {
      return {
        pass: false,
        message: () =>
          `Expected Array but received: ${this.utils.printReceived(value)}`,
      };
    }
  },
  // `expect().toBeTypeof(typeof)`
  toBeTypeof(actual, want) {
    if (typeof actual === want) {
      return {
        pass: true,
        message: () => ""
      };
    } else {
      return {
        pass: false,
        message: () => `Expected "${want}" but got "${typeof actual}"`
      };
    }
  },
  // `expect().toBeIncludedBy(ARRAY)`
  toBeIncludedBy(actual, want) {
    if (Array.isArray(want) && want.includes(actual)) {
      return {
        pass: true,
        message: () => ""
      };
    } else {
      return {
        pass: false,
        message: () => `Expected ${want} to include ${actual}`
      };
    }
  },
  // `expect().toMatchEndpointSuccessObject(endpoint)`
  toMatchEndpointSuccessObject(sso, endpoint) {
    let done = false;
    for (const response in endpoint.docs.responses) {
      // We use `==` to facilitate type coercion
      if (response == endpoint.endpoint.successStatus) {
        let obj = endpoint.docs.responses[response].content["application/json"];

        if (obj.startsWith("$")) {
          obj = require(`../models/${obj.replace("$","")}.js`);
        }

        expect(sso.content).toMatchObject(obj.test);
        done = true;
        break;
      }
    }
    if (done) {
      return {
        pass: true, message: () => ""
      };
    } else {
      return {
        pass: false,
        message: () =>
          `Unable to find ${endpoint.endpoint.successStatus}.`
      };
    }
  },
  // `expect().toHaveHTTPCode()`
  toHaveHTTPCode(req, want) {
    // Type coercion here because the statusCode in the request object could be set as a string.
    if (req.statusCode == want) {
      return {
        pass: true,
        message: () => "",
      };
    } else {
      return {
        pass: false,
        message: () =>
          `Expected HTTP Status Code: ${want} but got ${req.statusCode}`,
      };
    }
  },
});

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

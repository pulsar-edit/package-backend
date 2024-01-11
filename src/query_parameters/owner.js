/**
 * @function user
 * @param {object} req - The `Request` object inherited from the Express
 *   endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid or
 *   nonexistent. Returns the user name otherwise.
 */

const utils = require("./utils.js");

module.exports = {
  schema: {

  },
  logic: (req) => {
    if (!utils.stringValidation(req.query.owner)) {
      return false;
    }
    if (req.query.owner.length === 0) {
      return false;
    }
    return req.query.owner;
  }
};

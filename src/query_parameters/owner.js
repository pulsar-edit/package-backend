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
    // Owner accepts the owner as an argument for things like search,
    // as well as a path, for the endpoint `/api/owners/:ownerName`
    let prov = req.query.owner ?? req.params?.ownerName ?? null;

    if (!utils.stringValidation(prov)) {
      return false;
    }
    if (prov.length === 0) {
      return false;
    }
    return prov;
  }
};

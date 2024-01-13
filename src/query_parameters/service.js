/**
 * @function service
 * @desc Returns the service being requested.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid or
 * nonexistent. Returns the service string otherwise.
 */
const utils = require("./utils.js");

module.exports = {
  schema: {
    name: "service",
    in: "query",
    schema: {
      type: "string"
    },
    example: "autocomplete.watchEditor",
    allowEmptyValue: true,
    description: "The service of which to filter packages by"
  },
  logic: (req) => {
    return utils.stringValidation(req.query.service);
  }
};

/**
 * @function fileExtension
 * @desc Returns the file extension being requested.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid, or
 * nonexistant. Returns the service string otherwise.
 */
const utils = require("./utils.js");

module.exports = {
  schema: {
    name: "fileExtension",
    in: "query",
    schema: {
      type: "string",
    },
    example: "coffee",
    allowEmptyValue: true,
    description:
      "File extension for which to show only compatible grammar packages of.",
  },
  logic: (req) => {
    return utils.stringValidation(req.query.fileExtension);
  },
};

const utils = require("./utils.js");
/**
 * @function query
 * @desc Checks the 'q' query parameter, trunicating it at 50 characters, and checking simplisticly that
 * it is not a malicious request. Returning "" if an unsafe or invalid query is passed.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} A valid search string derived from 'q' query parameter. Or '' if invalid.
 * @implements {pathTraversalAttempt}
 */

module.exports = {
  schema: {
    name: "q",
    in: "query",
    schema: {
      type: "string"
    },
    example: "generic-lsp",
    required: true,
    description: "Search Query"
  },
  logic: (req) => {
    const maxLength = 50; // While package.json names according to NPM can be up to 214 characters,
    // for performance on the server and assumed deminishing returns on longer queries,
    // this is cut off at 50 as suggested by Digitalone1.
    const prov = req.query.q;

    if (typeof prov !== "string") {
      return "";
    }

    // If there is a path traversal attach detected return empty query.
    // Additionally do not allow strings longer than `maxLength`
    return utils.pathTraversalAttempt(prov) ? "" : prov.slice(0, maxLength).trim();
  }
};

/**
 * @function tags
 * @desc Returns the tags being requested.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid or
 * nonexistent. Returns the 'tags' string otherwise.
 */
const utils = require("./utils.js");

module.exports = {
  schema: {
    name: "tags",
    in: "query",
    schema: {
      type: "string"
    },
    example: "tree-sitter",
    allowEmptyValue: true,
    description: "The 'tags' available via the 'keywords' entry of a package's 'package.json'.",
  },
  logic: (req) => {
    return utils.stringValidation(req.query.tags);
  },
};

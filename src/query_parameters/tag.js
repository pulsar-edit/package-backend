/**
 * @function tag
 * @desc Parses the 'tag' query parameter, returning it if valid, otherwise returning ''.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returns a valid 'tag' query parameter. Or '' if invalid.
 */

module.exports = {
  schema: {
    name: "tag",
    in: "query",
    schema: {
      type: "string",
    },
    example: "TODO",
    allowEmptyValue: false,
    required: false,
    description: "TODO",
  },
  logic: (req) => {
    return typeof req.query.tag !== "string" ? "" : req.query.tag;
  },
};

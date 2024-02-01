/**
 * @function login
 * @desc Returns the User from the URL Path, otherwise ''
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returns a valid specified user or ''.
 */

module.exports = {
  schema: {
    name: "login",
    in: "path",
    schema: {
      type: "string",
    },
    required: true,
    allowEmptyValue: false,
    example: "confused-Techie",
    description: "The User from the URL Path.",
  },
  logic: (req) => {
    return req.params.login ?? "";
  },
};

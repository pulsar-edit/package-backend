/**
 * @function auth
 * @desc Retrieves Authorization Headers from Request, and Checks for Undefined.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returning a valid Authorization Token, or '' if invalid/not found.
 */
module.exports = {
  schema: {
    name: "auth",
    in: "header",
    schema: {
      type: "string",
    },
    required: true,
    allowEmptyValue: false,
    description: "Authorization Headers.",
  },
  logic: (req) => {
    const token = req.get("Authorization");

    return token ?? "";
  },
};

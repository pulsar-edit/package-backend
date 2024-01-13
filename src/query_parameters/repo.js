/**
 * @function repo
 * @desc Parses the 'repository' query parameter, returning it if valid, otherwise returning ''.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returning the valid 'repository' query parameter, or '' if invalid.
 */

module.exports = {
  schema: {
    name: "repository",
    in: "query",
    schema: {
      type: "string",
    },
    example: "pulsar-edit/pulsar",
    allowEmptyValue: false,
    required: true,
    description: "Repository to publish.",
  },
  logic: (req) => {
    const prov = req.query.repository;

    if (prov === undefined) {
      return "";
    }

    const re = /^[-a-zA-Z\d][-\w.]{0,213}\/[-a-zA-Z\d][-\w.]{0,213}$/;

    // Ensure req is in the format "owner/repo" and
    // owner and repo observe the following rules:
    // - less than or equal to 214 characters
    // - only URL safe characters (letters, digits, dashes, underscores and/or dots)
    // - cannot begin with a dot or an underscore
    // - cannot contain a space.
    return prov.match(re) !== null ? prov : "";
  },
};

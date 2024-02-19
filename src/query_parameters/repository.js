/**
 * @function repo
 * @desc Parses the 'repository' query parameter, returning it if valid, otherwise returning ''.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returning the valid 'repository' query parameter, or '' if invalid.
 */
const parseGithubURL = require("parse-github-url");

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

    const parsed = parseGithubURL(prov);

    if (typeof parsed.owner !== "string" || typeof parsed.name !== "string") {
      return "";
    }

    const re = /^[^._ ][^ ]{0,213}$/;
    // Ensure both the name and owner:
    //  - less than or equal to 214 characters
    //  - cannot begin with a dot or an underscore
    //  - cannot contain a space

    if (parsed.owner.match(re) === null || parsed.name.match(re) === null) {
      return "";
    }

    return prov;
  },
};

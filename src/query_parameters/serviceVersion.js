/**
 * @function serviceVersion
 * @desc Returns the version of whatever service is being requested.
 * @param {object} req - The `Request` object inherited from the Express Endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid, or
 * nonexistant. Returns the version as a string otherwise.
 */

module.exports = {
  schema: {
    name: "serviceVersion",
    in: "query",
    schema: {
      type: "string",
    },
    example: "0.0.1",
    allowEmptyValue: true,
    description: "Filter by a specific version of the 'service'.",
  },
  logic: (req) => {
    const semver = req.query.serviceVersion;
    try {
      // Regex matching what's used in query.engine()
      const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/;

      // Check if it's a valid semver
      return semver.match(regex) !== null ? semver : false;
    } catch (err) {
      return false;
    }
  },
};

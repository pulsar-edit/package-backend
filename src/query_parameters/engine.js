/**
 * @function engine
 * @desc Parses the 'engine' query parameter to ensure it's valid, otherwise returning false.
 * @param {string} semver - The engine string.
 * @returns {string|boolean} Returns the valid 'engine' specified, or if none, returns false.
 */
module.exports = {
  schema: {
    name: "engine",
    in: "query",
    schema: {
      type: "string"
    },
    example: "1.0.0",
    allowEmptyValue: true,
    description: "Only show packages compatible with this Pulsar version. Must be a valid Semver."
  },
  // TODO: Why does this accept `semver` and not a request object?
  logic: (semver) => {
    try {
      // Regex inspired by:
      // - https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
      // - https://regex101.com/r/vkijKf/1/
      // The only difference is that we truncate the check for additional labels because we want to be
      // as permissive as possible and need only the first three version numbers.

      const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/;

      // Check if it's a valid semver
      return semver.match(regex) !== null ? semver : false;
    } catch (e) {
      return false;
    }
  }
};

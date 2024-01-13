/**
 * @function rename
 * @desc Since this is intended to be returning a boolean value, returns false
 * if invalid, otherwise returns true. Checking for mixed captilization.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {boolean} Returns false if invalid, or otherwise returns the boolean value of the string.
 */

module.exports = {
  schema: {
    name: "rename",
    in: "query",
    schema: {
      type: "string",
    },
    example: "new-package-name",
    allowEmptyValue: false,
    required: false,
    description: "The new package name to rename to, if applicable.",
  },
  logic: (req) => {
    const prov = req.query.rename;

    if (prov === undefined) {
      // Originally it was believed that this query parameter should be handled as
      // if it was a text passed boolean. But appears to actually provide the string
      // of text the package should be renamed too.
      return false;
    }

    // Due to the backend already being built in such a way that it will rename
    // a package by finding the rename value on it's own, we will still return a
    // boolean, but TODO:: this should be fixed in the future.

    if (typeof prov === "string" && prov.length > 0) {
      return true;
    }

    return false;
  },
};

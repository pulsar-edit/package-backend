/**
 * @function packageName
 * @desc This function will convert a user provided package name into a safe format.
 * It ensures the name is converted to lower case. As is the requirement of all package names.
 * @param {object} req - The `Request` Object inherited from the Express endpoint.
 * @returns {string} Returns the package name in a safe format that can be worked with further.
 */
module.exports = {
  schema: {
    name: "packageName",
    in: "path",
    schema: {
      type: "string",
    },
    required: true,
    allowEmptyValue: false,
    example: "autocomplete-powershell",
    description:
      "The name of the package to return details for. Must be URL escaped.",
  },
  logic: (req) => {
    return req.params.packageName.toLowerCase();
  },
};

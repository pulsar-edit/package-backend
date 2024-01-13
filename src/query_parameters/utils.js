/**
 * @function stringValidation
 * @desc Provides a generic Query Utility that validates if a provided value
 * is a string, as well as trimming it to the safe max length of query strings,
 * while additionally passing it through the Path Traversal Detection function.
 * @param {string} value - The value to check
 * @returns {string|boolean} Returns false if any check fails, otherwise returns
 * the valid string.
 */
function stringValidation(value) {
  const maxLength = 50;
  const prov = value;

  if (typeof prov !== "string") {
    return false;
  }

  return pathTraversalAttempt(prov) ? false : prov.slice(0, maxLength).trim();
}

/**
 * @function pathTraversalAttempt
 * @desc Completes some short checks to determine if the data contains a malicious
 * path traversal attempt. Returning a boolean indicating if a path traversal attempt
 * exists in the data.
 * @param {string} data - The data to check for possible malicious data.
 * @returns {boolean} True indicates a path traversal attempt was found. False otherwise.
 */
function pathTraversalAttempt(data) {
  // This will use several methods to check for the possibility of an attempted path traversal attack.

  // The definitions here are based off GoPage checks.
  // https://github.com/confused-Techie/GoPage/blob/main/src/pkg/universalMethods/universalMethods.go
  // But we leave out any focused on defended against URL Encoded values, since this has already been decoded.
  // const checks = [
  //   /\.{2}\//,   //unixBackNav
  //   /\.{2}\\/,   //unixBackNavReverse
  //   /\.{2}/,     //unixParentCatchAll
  // ];

  // Combine the 3 regex into one: https://regex101.com/r/CgcZev/1
  const check = /\.{2}(?:[/\\])?/;
  return data.match(check) !== null;
}

module.exports = {
  stringValidation,
  pathTraversalAttempt,
};

const utils = require("../utils.js");

// Shared handling of data for the owner query parameter

// Owner accepts the owner as an argument for things like search,
// as well as a path, for the endpoint `/api/owners/:ownerName`
module.exports = function main(value) {
  if (!utils.stringValidation(value)) {
    return false;
  }
  if (value.length === 0) {
    return false;
  }

  return value;
};

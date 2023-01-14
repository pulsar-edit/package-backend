'use strict'

// BigInt JSON serialization.
// JSDoc by default will fail when BigInts are used within the codebase
// https://github.com/jsdoc/jsdoc/issues/1918
BigInt.prototype.toJSON = function() {
  return this.toString() + 'n';
};

module.exports = {
  // There's no need for us to actually configure JSDoc
  // We are only using the config file to be able to parse BigInts
  // Once the above linked issue is resolved, we can remove our config
};

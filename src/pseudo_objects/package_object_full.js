// Potentially this file will provide specialized handling of the
// Package Object Full object within the backend.
// Abstracting complex functions, and reducing code duplication.

const PackageJSON = require("./package_json.js");

class PackageObjectFull extends PackageJSON {
  constructor() {
    super();
  }
}

module.exports = PackageObjectFull;

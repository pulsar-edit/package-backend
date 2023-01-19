// Potentially this class will provide easy support for interacting with a package.json
// file. Bundling all the common methods of interaction here to avoid code duplication.
// As well as uneasy error handling.

// NOTES: opts.pack is the raw package that can be passed.
// Other modifiers can be provided as other opts
class PackageJSON {
  constructor(opts) {
    this.rawPack = opts.pack ?? {};

    this.normalizedPack = {};
    // normalizedMode will contain certain modes and settings to enforce.
    this.mode = {
      strict: false, // strict Boolean will enforce strict adherance to specified service
      service: "npm", // service is the intended service for the package.json
    };
  }

  // Below we will define the standard Values that are supported as Getters and
  // as Setters
  // Each getter will always first check the normalizedPack for it's needed value.
  // Which if doesn't exist will work to find it in the rawPack.
  // Once found it will be added to the normalizedPack. Setters themselves
  // will only ever effect the normalizedPack. Ensuring we never overwrite
  // any part of the rawPack, in case it's needed again.

  /**
   * === PROPERTIES ===
   */
  get name() {

    // First lets see if it's in the normalizedPack
    if (typeof this.normalizedPack.name === "string") {
      return this.normalizedPack.name;
    }

    if (typeof this.rawPack.name === "string") {
      this.name = this.rawPack.name; // Use our setter to assign the value
      return this.name; // Return the output of our setter
    }

    // If we have reached this point then we know we can't find this value.
    // At this point we will return `undefined`
    return undefined;
  }

  set name(value) {
    if (this.mode.strict && this.mode.service === "npm") {
      let valid = this.validateNameNPM(value);

      if (valid.overall) {
        this.normalizedPack.name = value;
        return;
      }

      throw Error(`Name is not valid for NPM: ${valid.invalid}`);
      return;
    }

    // No strict declared
    this.normalizedPack.name = value;
  }

  get version() {
    if (typeof this.normalizedPack.version === "string") {
      return this.normalizedPack.version;
    }

    if (typeof this.rawPack.version === "string") {
      this.version = this.rawPack.version;
      return this.version;
    }

    return undefined;
  }

  set version(value) {
    this.normalizedPack.version = value;
  }

  get description() {
    if (typeof this.normalizedPack.description === "string") {
      return this.normalizedPack.description;
    }

    if (typeof this.rawPack.description === "string") {
      this.description = this.rawPack.description;
      return this.description;
    }

    return undefined;
  }

  set description(value) {
    this.normalizedPack.description = value;
  }

  get keywords() {
    if (Array.isArray(this.normalizedPack.keywords)) {
      return this.normalizedPack.keywords;
    }

    if (Array.isArray(this.rawPack.keywords)) {
      this.keywords = this.rawPack.keywords;
      return this.keywords;
    }

    return undefined;
  }

  set keywords(value) {
    this.normalizedPack.keywords = value;
  }

  get homepage() {
    if (typeof this.normalizedPack.homepage === "string") {
      return this.normalizedPack.homepage;
    }

    if (typeof this.rawPack.homepage === "string") {
      this.homepage = this.rawPack.homepage;
      return this.rawPack.homepage;
    }

    return undefined;
  }

  set homepage(value) {
    this.normalizedPack = value;
  }

  /**
   * === VALIDATORS ===
   */
   validateNameNPM() {
     // This will ensure the package name meets the criteria of NPMJS
     // https://docs.npmjs.com/cli/v9/configuring-npm/package-json#name
     let name = this.name;

     let length = false, characters = false;

     if (name.length === 214 || name.length < 214) {
       length = true;
     }

     if (!name.startsWith("_") && !name.startsWith(".")) {
       characters = true;
     }

     // Check for uppercase & URL safe

     let validArray = [];
     let invalidArray = [];

     if (length) {
       validArray.push("Length of Name");
     } else {
       invalidArray.push("Length of Name");
     }

     if (characters) {
       validArray.push("Allowed Characters");
     } else {
       invalidArray.push("Allowed Characters");
     }

     return {
       overall: (length && characters) ? true : false,
       valid: validArray,
       invalid: invalidArray
     };

   }
}

module.exports = PackageJSON;

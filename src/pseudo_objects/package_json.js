// Potentially this class will provide easy support for interacting with a package.json
// file. Bundling all the common methods of interaction here to avoid code duplication.
// As well as uneasy error handling.

// This Class seemingly would also be very helpful for the frontend, and is now being designed
// as possibly becoming it's own module, if proven useful.

// NOTES: opts.pack is the raw package that can be passed.
// Other modifiers can be provided as other opts
// Additionally: (This doesn't match currenlty) - The getters should simply locate
// the most likely location of the property that will contain the data requested.
// The setter itself should be in charge of validations, and error throwing.
// In the case where a getter cannot find anything relevant, -1 should be returned.
class PackageJSON {
  constructor(opts) {
    this.rawPack = opts.pack ?? {};

    this.normalizedPack = {};
    // normalizedMode will contain certain modes and settings to enforce.
    this.mode = {
      strict: opts.mode.strict ?? false, // strict Boolean will enforce strict adherance to specified service
      service: opts.mode.service ?? "npm", // service is the intended service for the package.json
      bug: opts.mode.bug ?? "string", // The Bug Mode used. Either Object or String is valid. Default can be used to stick with what's currently used.
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
    if (this.mode.strict && typeof this.mode.service !== "undefined") {
      let valid = this.validateName(this.mode.service);

      if (valid.overall) {
        this.normalizedPack.name = value;
        return;
      }

      throw new Error(`Name is not valid for ${this.mode.service}: ${valid.invalid}`);
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
      return this.homepage;
    }

    return undefined;
  }

  set homepage(value) {
    this.normalizedPack = value;
  }

  get bugs() {
    // this.mode.bugs can be Default, Object, or String
    if (this.mode.bugs === "default" && typeof this.normalizedPack.bugs !== "undefined") {
      return this.normalizedPack.bugs;
    }

    if (typeof this.normalizedPack.bugs === this.mode.bugs) {
      return this.normalizedPack.bugs;
    }

    // Because Bugs has two modes, we will attempt to support either.
    if (typeof this.rawPack.bugs === "string") {
      switch(this.mode.bugs) {
        case "object":
          // we need to figure out if this is a URL or an email
        case "string":
        case "default":
        default:
          this.bugs = this.rawPack.bugs;
          return this.bugs;
      }
    }

    if (typeof this.rawPack.bugs === "object") {
      switch(this.mode.bugs) {
        case "string":
          // Since when Bugs are in string mode we can only define a URL,
          // we will throw away the email part of the object.
          if (typeof this.rawPack.bugs.url !== "undefined") {
            this.bugs = this.rawPack.bugs.url;
            return this.bugs;
          }
          return undefined;
        case "object":
        case "default":
        default:
          if (typeof this.rawPack.bugs.url !== "undefined" && typeof this.rawPack.bugs.email !== "undefined") {
            this.bugs = this.rawPack.bugs;
            return this.bugs;
          }
          return undefined;
      }
    }

    return undefined;
  }

  set bugs(value) {
    if (this.mode.bugs === "object" || typeof value === "object") {
      if (typeof value.url !== "undefined" && typeof value.email !== "undefined") {
        this.normalizedPack.bugs = value;
        return;
      }
    }

    if (this.mode.bugs === "string" || typeof value === "string") {
      if (typeof value === "string") {
        // Also ensure it is a valid URL
        this.normalizedPack.bugs = value;
        return;
      }
    }

    throw new Error(`Bugs value does't match ${this.mode.bugs} Bugs Mode`);
  }

  /**
   * === VALIDATORS ===
   */
   validateName(service) {
     switch(service) {
       case "npm": {
         // This will ensure the package name meets the criteria of NPMJS
         // https://docs.npmjs.com/cli/v9/configuring-npm/package-json#name
         let name = this.name;
         let validArray = [];
         let invalidArray = [];

         let length = {
           status: false,
           msg: "Length of Name"
         };
         let characters = {
           status: false,
           msg: "Allowed Characters"
         };

         if (name.length === 214 || name.length < 214) {
           length.status = true;
           validArray.push(length.msg);
         }

         if (!name.startsWith("_") && !name.startsWith(".")) {
           characters.status = true;
           validArray.push(characters.msg);
         }

         // Check for uppercase & URL safe

        if (!length.status) {
          invalidArray.push(length.msg);
        }

        if (!characters.status) {
          invalidArray.push(characters.msg);
        }

        return {
          overall: (length.status && characters.status) ? true : false,
          valid: validArray,
          invalid: invalidArray
        };

       }
       default: {
         // Since we found no explicit matching service, we will return fine.
         return {
           overall: true,
           valid: [],
           invalid: []
         };
       }
     }
   }

   /**
    * === METHODS ===
    */
    parse(pack) {
      // parse() accepts an optional `pack`, which can be used if PackageJSON was
      // instiatied without passing any package data. In which case will be assigned
      // here then have the whole file parsed, if left out the package data passed
      // during class creation will be used. Erroring out if none is provided in either.

      if (typeof pack !== "undefined") {
        this.rawPack = pack;
      }

      if (typeof this.rawPack === "undefined") {
        throw new Error("Raw PackageJSON Data never provided");
        return;
      }

      // Now we know we should have this.rawPack defined properly, lets initiate parsing.

      // Since the getter will find and assign all values using the setter, we now
      // simply have to get every supported value.

      for (const key in this.rawPack) {

        if (typeof this[key] !== "function") {
          // We don't have a method that supports the key found in the package.json
          // It should be added arbitraly.
          this.normalizedPack[key] = this.rawpack[key];
          break;
        }

        // We know that the key taken from the package.json has a supported method.
        // Lets call it.
        this[key]();
      }

      return this.normalizedPack;
    }

}

module.exports = PackageJSON;

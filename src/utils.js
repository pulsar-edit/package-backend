/**
 * @module utils
 * @desc A helper for any functions that are agnostic in handlers.
 */
const logger = require("./logger.js");
const storage = require("./storage.js");
const { server_url } = require("./config.js").getConfig();
const crypto = require("crypto");

/**
 * @async
 * @function isPackageNameBanned
 * @desc This uses the `storage.js` to retreive a banlist. And then simply
 * iterates through the banList array, until it finds a match to the name
 * it was given. If no match is found then it returns false.
 * @param {string} name - The name of the package to check if it is banned.
 * @returns {object} Returns Server Status Object with ok as true if blocked,
 * false otherwise.
 */
async function isPackageNameBanned(name) {
  let banList = await storage.getBanList();
  if (!banList.ok) {
    // we failed to find the ban list. For now we will just return ok.
    logger.generic(3, "Unable to Locate Name Ban List", {
      type: "error",
      err: banList.content,
    });
    return { ok: true };
  }

  logger.generic(6, "Success Status while retreiving Name Ban List.");
  return banList.content.find((b) => name === b) ? { ok: true } : { ok: false };
}

/**
 * @async
 * @function constructPackageObjectFull
 * @desc Takes the raw return of a full row from database.getPackageByName() and
 * constructs a standardized package object full from it.
 * This should be called only on the data provided by database.getPackageByName(),
 * otherwise the behavior is unexpected.
 * @param {object} pack - The anticipated raw SQL return that contains all data
 * to construct a Package Object Full.
 * @returns {object} A properly formatted and converted Package Object Full.
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/returns.md#package-object-full}
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/queries.md#retrieve-single-package--package-object-full}
 */
async function constructPackageObjectFull(pack) {
  const parseVersions = (vers) => {
    let retVer = {};

    for (const v of vers) {
      retVer[v.semver] = v.meta;
      retVer[v.semver].license = v.license;
      retVer[v.semver].engine = v.engine;
      retVer[v.semver].dist = {
        tarball: `${server_url}/api/packages/${pack.name}/versions/${v.semver}/tarball`,
      };
    }

    return retVer;
  };

  const findLatestVersion = (vers) => {
    for (const v of vers) {
      if (v.status === "latest") {
        return v.semver;
      }
    }
    return null;
  };

  let newPack = pack.data;
  newPack.name = pack.name;
  newPack.downloads = pack.downloads;
  newPack.stargazers_count = pack.stargazers_count;
  newPack.versions = parseVersions(pack.versions);
  newPack.releases = {
    latest: findLatestVersion(pack.versions),
  };

  logger.generic(6, "Built Package Object Full without Error");

  return newPack;
}

/**
 * @async
 * @function constructPackageObjectShort
 * @desc Takes a single or array of rows from the db, and returns a JSON
 * construction of package object shorts
 * @param {object} pack - The anticipated raw SQL return that contains all data
 * to construct a Package Object Short.
 * @returns {object|array} A properly formatted and converted Package Object Short.
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/returns.md#package-object-short}
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/queries.md#retrieve-many-sorted-packages--package-object-short}
 */
async function constructPackageObjectShort(pack) {
  const parsePackageObject = (p) => {
    let newPack = p.data;
    newPack.downloads = p.downloads;
    newPack.stargazers_count = p.stargazers_count;
    newPack.releases = {
      latest: p.semver,
    };
    return newPack;
  };

  if (Array.isArray(pack)) {
    if (pack.length === 0) {
      // Sometimes it seems an empty array will be passed here, in that case we will protect against
      // manipulation of `undefined` objects
      logger.generic(
        5,
        "Package Object Short Constructor Protected against 0 Length Array"
      );

      return pack;
    }

    let retPacks = [];
    for (const p of pack) {
      retPacks.push(parsePackageObject(p));
    }

    logger.generic(6, "Array Package Object Short Constructor without Error");
    return retPacks;
  }

  // Not an array
  if (
    pack.data === undefined ||
    pack.downloads === undefined ||
    pack.stargazers_count === undefined ||
    pack.semver === undefined
  ) {
    logger.generic(
      5,
      "Package Object Short Constructor Protected against Undefined Required Values"
    );

    return {};
  }

  logger.generic(6, "Single Package Object Short Constructor without Error");
  return parsePackageObject(pack);
}

/**
 * @async
 * @function constructPackageObjectJSON
 * @desc Takes the return of getPackageVersionByNameAndVersion and returns
 * a recreation of the package.json with a modified dist.tarball key, poionting
 * to this server for download.
 * @param {object} pack - The expected raw SQL return of `getPackageVersionByNameAndVersion`
 * @returns {object} A properly formatted Package Object Mini.
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/returns.md#package-object-mini}
 */
async function constructPackageObjectJSON(pack) {
  const parseVersionObject = (v) => {
    let newPack = v.meta;
    if (newPack.sha) {
      delete newPack.sha;
    }
    newPack.dist ??= {};
    newPack.dist.tarball = `${server_url}/api/packages/${v.meta.name}/versions/${v.semver}/tarball`;
    newPack.engines = v.engine;
    logger.generic(6, "Single Package Object JSON finished without Error");
    return newPack;
  };

  if (!Array.isArray(pack)) {
    const newPack = parseVersionObject(pack);

    logger.generic(6, "Single Package Object JSON finished without Error");
    return newPack;
  }

  let arrPack = [];
  for (const p of pack) {
    arrPack.push(parseVersionObject(p));
  }

  logger.generic(66, "Array Package Object JSON finished without Error");
  return arrPack;
}

/**
 * @async
 * @function engineFilter
 * @desc A complex function that provides filtering by Atom engine version.
 * This should take a package with it's versions and retreive whatever matches
 * that engine version as provided.
 * @returns {object} The filtered object.
 */
async function engineFilter(pack, engine) {
  // If a compatible version is found, we add its data to the metadata property of the package
  // Otherwise we return an unmodified package, so that it is usable to the consumer.

  // Validate engine type.
  if (typeof engine !== "string") {
    logger.generic(5, "engineFilter returning non-string pack.", {
      type: "object",
      obj: pack,
    });
    return pack;
  }

  const engSv = semverArray(engine);

  // Validate engine semver format.
  if (engSv === null) {
    logger.generic(5, "engineFilter returning non-valid Engine semverArray", {
      type: "object",
      obj: engSv,
    });
    return pack;
  }

  // We will want to loop through each version of the package, and check its engine version against the specified one.
  let compatibleVersion = "";

  for (const ver in pack.versions) {
    // Make sure the key we need is available, otherwise skip the current loop.
    if (!pack.versions[ver].engines.atom) {
      continue;
    }

    // Core Atom Packages contain '*' as the engine type, and will require a manual check.
    if (pack.versions[ver].engines.atom === "*") {
      break;
    }

    // Track the upper and lower end conditions.
    // Null type means not available; Bool type means available with the relative result.
    let lowerEnd = null;
    let upperEnd = null;

    // Extract the lower end semver condition (i.e >=1.0.0)
    const lowSv = pack.versions[ver].engines.atom.match(
      /(>=?)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/
    );

    if (lowSv != null) {
      // Lower end condition present, so test it.
      switch (lowSv[0]) {
        case ">":
          lowerEnd = semverGt(
            [engSv[0], engSv[1], engSv[2]],
            [lowSv[2], lowSv[3], lowSv[4]]
          );

          break;
        case ">=":
          lowerEnd =
            semverGt(
              [engSv[0], engSv[1], engSv[2]],
              [lowSv[2], lowSv[3], lowSv[4]]
            ) ||
            semverEq(
              [engSv[0], engSv[1], engSv[2]],
              [lowSv[2], lowSv[3], lowSv[4]]
            );

          break;
      }
    }

    // Extract the upper end semver condition (i.e <=2.0.0)
    const upSv = pack.versions[ver].engines.atom.match(
      /(<=?)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/
    );

    if (upSv != null) {
      // Upper end condition present, so test it.
      switch (upSv[1]) {
        case "<":
          upperEnd = semverLt(
            [engSv[0], engSv[1], engSv[2]],
            [upSv[2], upSv[3], upSv[4]]
          );

          break;
        case "<=":
          upperEnd =
            semverLt(
              [engSv[0], engSv[1], engSv[2]],
              [upSv[2], upSv[3], upSv[4]]
            ) ||
            semverEq(
              [engSv[0], engSv[1], engSv[2]],
              [upSv[2], upSv[3], upSv[4]]
            );

          break;
      }
    }

    if (lowerEnd === null && upperEnd === null) {
      // Both lower and upper end condition are unavailable.
      // So, as last resort, check if there is an equality condition (i.e =1.0.0)
      const eqSv = pack.versions[ver].engines.atom.match(
        /^=(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
      );

      if (
        eqSv !== null &&
        semverEq([engSv[0], engSv[1], engSv[2]], [eqSv[1], eqSv[2], eqSv[3]])
      ) {
        compatibleVersion = ver;

        break; // Found the compatible version, break the loop.
      }

      // Equality condition unavailable or not satisfied, skip the current loop.
      continue;
    }

    // One of the semver condition may still be not present.
    if (lowerEnd === null) {
      // Only upper end available
      if (upperEnd) {
        compatibleVersion = ver;

        break; // The version is under the upper end, break the loop.
      }
    } else if (upperEnd === null) {
      // Only lower end available
      if (lowerEnd) {
        compatibleVersion = ver;

        break; // The version is over the lower end, break the loop.
      }
    }

    // Both lower and upper end are available.
    if (lowerEnd && upperEnd) {
      compatibleVersion = ver;

      break; // The version is within the range, break the loop.
    }
  }

  // After the loop ends, or breaks, check the extracted compatible version.
  if (compatibleVersion === "") {
    // No valid version found.
    return pack;
  }

  // We have a compatible version, let's add its data to the metadata property of the package.
  pack.metadata = pack.versions[compatibleVersion];

  return pack;
}

/**
 * @function semverArray
 * @desc Takes a semver string and returns it as an Array of strings.
 * This can also be used to check for semver valitidy. If it's not a semver, null is returned.
 * @param {string} semver
 * @returns {array|null} The formatted semver in array of three strings, or null if no match.
 * @example <caption>Valid Semver Passed</caption>
 * // returns ["1", "2", "3" ]
 * semverArray("1.2.3");
 * @example <caption>Invalid Semver Passed</caption>
 * // returns null
 * semverArray("1.Hello.World");
 */
function semverArray(semver) {
  let array =
    typeof semver === "string"
      ? semver.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/) ?? []
      : [];

  // returning null on no match
  return array.length !== 4 ? null : array.slice(1, 4);
}

/**
 * @function semverGt
 * @desc Compares two sermver and return true if the first is greater than the second.
 * Expects to get the semver formatted as array of strings.
 * Should be always executed after running semverArray.
 * @param {array} a1 - First semver as array of strings.
 * @param {array} a2 - Second semver as array of string.
 * @returns {boolean} The result of the comparison
 */
function semverGt(a1, a2) {
  const v1 = a1.map((n) => parseInt(n, 10));
  const v2 = a2.map((n) => parseInt(n, 10));

  if (v1[0] > v2[0]) {
    return true;
  } else if (v1[0] < v2[0]) {
    return false;
  }

  if (v1[1] > v2[1]) {
    return true;
  } else if (v1[1] < v2[1]) {
    return false;
  }

  return v1[2] > v2[2];
}

/**
 * @function semverLt
 * @desc Compares two sermver and return true if the first is less than the second.
 * Expects to get the semver formatted as array of strings.
 * Should be always executed after running semverArray.
 * @param {array} a1 - First semver as array of strings.
 * @param {array} a2 - Second semver as array of strings.
 * @returns {boolean} The result of the comparison
 */
function semverLt(a1, a2) {
  const v1 = a1.map((n) => parseInt(n, 10));
  const v2 = a2.map((n) => parseInt(n, 10));

  if (v1[0] < v2[0]) {
    return true;
  } else if (v1[0] > v2[0]) {
    return false;
  }

  if (v1[1] < v2[1]) {
    return true;
  } else if (v1[1] > v2[1]) {
    return false;
  }

  return v1[2] < v2[2];
}

/**
 * @function semverEq
 * @desc Compares two sermver and return true if the first is equal to the second.
 * Expects to get the semver formatted as array of strings.
 * Should be always executed after running semverArray.
 * @param {array} a1 - First semver as array
 * @param {array} a2 - Second semver as array
 * @returns {boolean} The result of the comparison
 */
function semverEq(a1, a2) {
  return a1[0] === a2[0] && a1[1] === a2[1] && a1[2] === a2[2];
}

/**
 * @class StateStore
 * @classdesc This simple state store acts as a hash map, allowing authentication request
 * to quickly add a new state related to an IP, and retrieve it later on.
 * These states are used during the authentication flow to help ensure against malicious activity.
 */
class StateStore {
  constructor() {
    logger.generic(6, "StateStore Initialized");
    this.hashmap = {};
    // In the future ideally we could allow the choice of how to generate the state
    // But in this case it'll currently be hard coded
  }
  /**
   * @function getState
   * @desc `getState` of `StateStore` checks if the given IP in the hashmap matches
   * the given IP and given State in the StateStore.
   * @param {string} ip - The IP Address to check with.
   * @param {string} state - The State to check with.
   * @returns {object} A Server Status Object, where `ok` is true if the IP corresponds to
   * the given state. And `ok` is false otherwise.
   */
  getState(ip, state) {
    logger.generic(
      4,
      `StateStore.getState() Called with IP: ${ip} - State: ${state}`
    );
    logger.generic(
      6,
      `StateStore.getState(): HashMap Report - HashMap Size: ${
        Object.keys(this.hashmap).length
      }`
    );

    if (this.hashmap[ip] == state) {
      logger.generic(
        6,
        `StateStore.getState() Successfully Returning for IP: ${ip} - State: ${state}`
      );
      return { ok: true, content: this.hashmap[ip] };
    } else {
      logger.generic(
        3,
        `StateStore.getState() Fail Returning for IP: ${ip} - State: ${state}`
      );
      logger.generic(
        3,
        `StateStore.getState() Fail Return Anyway due to bug: ${ip}`
      );
      return {
        ok: true,
        content: state,
      };
      // The design here is flawed. Essentially it seems that because we are behind a load balancer
      // the process here needs to retain the stateStore, but there's no guarantee that
      // one request will hit the same state store, so we will temporarily disable this,
      // and instead use the state store as a microservice
      //return {
      //  ok: false,
      //  short: "Not Found",
      //  content: "Couldn't find IP within StateStore",
      //};
    }
  }
  /**
   * @function setState
   * @desc A Promise that inputs the given IP into the StateStore, and returns
   * it's generated State Hash.
   * @param {string} ip - The IP to enter into the State Store.
   * @returns {object} A Server Status Object where if `ok` is true, `content` contains
   * the generated state.
   */
  setState(ip) {
    return new Promise((resolve, reject) => {
      logger.generic(6, `StateStore.setState() Called with IP: ${ip}`);
      crypto.generateKey("aes", { length: 128 }, (err, key) => {
        if (err) {
          logger.generic(
            2,
            "StateStore.setState() crypto.generateKey() Failed!",
            {
              type: "error",
              err: err,
            }
          );
          reject({
            ok: false,
            short: "Server Error",
            content: `Failed to generate AES State: ${err}`,
          });
        }
        let state = key.export().toString("hex");
        this.hashmap[ip] = state;
        logger.generic(
          5,
          "StateStore.setState() Successfully added IP and State to Hashmap"
        );
        resolve({ ok: true, content: state });
      });
    });
  }
}

module.exports = {
  isPackageNameBanned,
  constructPackageObjectFull,
  constructPackageObjectShort,
  constructPackageObjectJSON,
  engineFilter,
  semverArray,
  semverGt,
  semverLt,
  semverEq,
  StateStore,
};

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
 * @desc This uses the `storage.js` to retrieve a banlist. And then simply
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

  logger.generic(6, "Success Status while retrieving Name Ban List.");
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

  // We need to copy the metadata of the latest version in order to avoid an
  // auto-reference in the versions array that leads to a freeze in JSON stringify stage.
  let newPack = structuredClone(pack?.versions[0]?.meta ?? {});
  newPack.name = pack.name;
  newPack.downloads = pack.downloads;
  newPack.stargazers_count = pack.stargazers_count;
  newPack.versions = parseVersions(pack.versions);
  // database.getPackageByName() sorts the JSON array versions in descending order,
  // so no need to find the latest semver, it's the first one (index 0).
  newPack.releases = { latest: pack?.versions[0]?.semver ?? "" };

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
    return {
      ...p.data,
      downloads: p.downloads,
      stargazers_count: p.stargazers_count,
      releases: { latest: p.semver },
    };
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
 * a recreation of the package.json with a modified dist.tarball key, pointing
 * to this server for download.
 * @param {object} pack - The expected raw SQL return of `getPackageVersionByNameAndVersion`
 * @returns {object} A properly formatted Package Object Mini.
 * @see {@link https://github.com/confused-Techie/atom-backend/blob/main/docs/returns.md#package-object-mini}
 */
async function constructPackageObjectJSON(pack) {
  const parseVersionObject = (v) => {
    const dist = v.meta?.dist ?? {};
    let newPack = {
      ...v.meta,
      dist: {
        ...dist,
        tarball: `${server_url}/api/packages/${v.meta.name}/versions/${v.semver}/tarball`,
        engines: v.engine,
      },
    }
    delete newPack.sha;

    logger.generic(6, "Single Package Object JSON finished without Error");
    return newPack;
  };

  if (!Array.isArray(pack)) {
    const newPack = parseVersionObject(pack);

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
 * This should take a package with it's versions and retrieve whatever matches
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

    if (lowSv !== null) {
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

    if (upSv !== null) {
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

  // Returning null on no match or slice the array to get only indexes from 1 to 3.
  return array.length !== 4 ? null : array.slice(1);
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
 * @function getOwnerRepoFromPackage
 * @desc A function that takes a package and tries to extract `owner/repo` string from it
 * relying on getOwnerRepoFromUrlString util.
 * @param {object} pack - The Github package.
 * @returns {string} The `owner/repo` string from the URL. Or an empty string if unable to parse.
 */
// TODO: This should be moved inside VCS along with getOwnerRepoFromUrlString
function getOwnerRepoFromPackage(pack) {
  // pack.repository.url should be enough, but in case GitHub in the future decides to change it,
  // we use other properties to have chances to still extract the owner/repo string.
  const props = [pack?.repository?.url, pack?.metadata?.repository];

  let repo = "";
  for (const p of props) {
    repo = getOwnerRepoFromUrlString(p);
    if (repo !== "") {
      break;
    }
  }

  return repo;
}

/**
 * @function getOwnerRepoFromUrlString
 * @desc A function that takes the URL string of a GitHub repo and return the `owner/repo`
 * string for the repo. Intended to be used from a packages entry `data.repository.url`
 * @param {string} url - The URL for the Repo.
 * @returns {string} The `owner/repo` string from the URL. Or an empty string if unable to parse.
 */
function getOwnerRepoFromUrlString(url) {
  if (typeof url !== "string") {
    return "";
  }

  // Simplified version of the regex here: https://regex101.com/r/3OMBy2/3
  // The following is the optimized version using the positive lookaheads, atomic groups and
  // capturing groups to avoid backtracking: https://regex101.com/r/I5p3OT/2
  const reg =
    /(?=(https:\/\/(?:www\.)?github\.com\/|git@github\.com:))\1(?=((?:[\w\-\.]+)\/(?:[\w\-\.]+)))\2/;

  const res = url.match(reg);

  if (res === null || res?.length !== 3) {
    logger.generic(3, `getOwnerRepoFromUrlString Unable to parse: ${url}`);
    return "";
  }

  // Since backtracking is not allowed, the final ".git" is captured if present,
  // so we remove it before return.
  return res[2].replace(/\.git$/, "");
}

/**
 * @function semverEq
 * @desc Compares two sermver and return true if the first is equal to the second.
 * Expects to get the semver formatted as array of strings.
 * Should be always executed after running semverArray.
 * @param {array} a1 - First semver as array.
 * @param {array} a2 - Second semver as array.
 * @returns {boolean} The result of the comparison.
 */
function semverEq(a1, a2) {
  return a1[0] === a2[0] && a1[1] === a2[1] && a1[2] === a2[2];
}

/**
 * @function generateRandomString
 * @desc Uses the crypto module to generate and return a random string.
 * @param {string} n - The number of bytes to generate.
 * @returns {string} A string exported from the generated Buffer using the "hex" format (encode
 * each byte as two hexadecimal characters).
 */
function generateRandomString(n) {
  return crypto.randomBytes(n).toString("hex");
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
  getOwnerRepoFromPackage,
  getOwnerRepoFromUrlString,
  generateRandomString,
};

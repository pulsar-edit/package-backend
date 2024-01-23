/**
 * @module utils
 * @desc A helper for any functions that are agnostic in handlers.
 */
const logger = require("./logger.js");
const storage = require("./storage.js");
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
 * @function engineFilter
 * @desc A complex function that provides filtering by Atom engine version.
 * This should take a package with its versions and retrieve whatever matches
 * that engine version as provided.
 * @returns {object} The filtered object.
 */
// eslint-disable-next-line complexity
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

  // We will want to loop through each version of the package, and check its
  // engine version against the specified one.
  let compatibleVersion = "";

  for (const ver in pack.versions) {
    // Make sure the key we need is available, otherwise skip the current loop.
    if (!pack.versions[ver].engines.atom) {
      continue;
    }

    // Core Atom Packages contain '*' as the engine type, and will require a
    // manual check.
    if (pack.versions[ver].engines.atom === "*") {
      break;
    }

    // Track the upper and lower end conditions.
    // Null type means not available; Bool type means available with the
    // relative result.
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
  engineFilter,
  semverArray,
  semverGt,
  semverLt,
  semverEq,
  getOwnerRepoFromPackage,
  getOwnerRepoFromUrlString,
  generateRandomString,
};

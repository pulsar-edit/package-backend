/**
 * @module utils
 * @desc A helper for any functions that are agnostic in handlers.
 */
const logger = require("./logger.js");
const storage = require("./storage.js");
const crypto = require("crypto");
const semver = require("semver");

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
 * @desc A function that provides filtering by Atom engine version.
 * This should take a package with its versions and retrieve whatever matches
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

  const engineValid = semver.valid(engine);

  // Validate engine semver format.
  if (engineValid === null) {
    logger.generic(5, "engineFilter returning non-valid Engine semverArray", {
      type: "object",
      obj: engineValid,
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

    const rangeValid = semver.validRange(pack.versions[ver].engines.atom);

    if (!rangeValid) {
      // If it's not a valid range, skip the current loop
      continue;
    }

    if (semver.satisfies(engineValid, rangeValid)) {
      compatibleVersion = ver;
      break;
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
  getOwnerRepoFromPackage,
  getOwnerRepoFromUrlString,
  generateRandomString,
};

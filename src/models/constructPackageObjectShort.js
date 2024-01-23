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

const logger = require("../logger.js");

module.exports =
async function constructPackageObjectShort(pack) {
  const parsePackageObject = (p) => {
    let newPack = p.data;
    newPack.downloads = p.downloads;
    newPack.stargazers_count = p.stargazers_count;
    newPack.releases = {
      latest: p.semver,
    };

    if (!Array.isArray(newPack.badges)) {
      // A package that has yet to receive any permenant badges
      newPack.badges = [];
    }

    // Apply any custom deliver time badges
    if (p.creation_method === "User Made Package") {
      newPack.badges.push({ title: "Made for Pulsar!", type: "success" });
    }

    // Remove keys that aren't intended to exist in a Package Object Short
    delete newPack.versions;

    newPack.owner = p.owner;
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

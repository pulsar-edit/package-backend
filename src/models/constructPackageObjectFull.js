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
const logger = require("../logger.js");
const { server_url } = require("../config.js").getConfig();

module.exports = async function constructPackageObjectFull(pack) {
  const parseVersions = (vers) => {
    let retVer = {};

    for (const v of vers) {
      retVer[v.semver] = v.meta;
      retVer[v.semver].license = v.license;
      retVer[v.semver].engines = v.engines;
      retVer[v.semver].dist = {
        tarball: `${server_url}/api/packages/${pack.name}/versions/${v.semver}/tarball`,
      };
    }

    return retVer;
  };

  // We need to copy the metadata of the latest version in order to avoid an
  // auto-reference in the versions array that leads to a freeze in JSON stringify stage.
  //let newPack = structuredClone(pack?.versions[0]?.meta ?? {});
  let newPack = pack.data;
  newPack.name = pack.name;
  newPack.downloads = pack.downloads;
  newPack.owner = pack.owner;
  newPack.stargazers_count = pack.stargazers_count;
  newPack.versions = parseVersions(pack.versions);
  // database.getPackageByName() sorts the JSON array versions in descending order,
  // so no need to find the latest semver, it's the first one (index 0).
  newPack.releases = { latest: pack?.versions[0]?.semver ?? "" };

  if (!Array.isArray(newPack.badges)) {
    // A package that has yet to receive any permenant badges
    newPack.badges = [];
  }

  // Apply any custom deliver time badges
  if (pack.creation_method === "User Made Package") {
    newPack.badges.push({
      title: "Made for Pulsar!",
      type: "success",
    });
  }

  logger.generic(6, "Built Package Object Full without Error");

  return newPack;
};

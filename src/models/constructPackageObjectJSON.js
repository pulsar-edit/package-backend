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

const logger = require("../logger.js");
const { server_url } = require("../config.js").getConfig();

module.exports =
async function constructPackageObjectJSON(pack) {
  const parseVersionObject = (v) => {
    let newPack = v.meta;
    if (newPack.sha) {
      delete newPack.sha;
    }
    if (newPack.tarball_url) {
      delete newPack.tarball_url;
    }
    newPack.dist ??= {};
    newPack.dist.tarball = `${server_url}/api/packages/${v.meta.name}/versions/${v.semver}/tarball`;
    newPack.engines = v.engines;
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

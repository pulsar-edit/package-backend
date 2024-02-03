/**
 * @async
 * @function getFeaturedThemes
 * @desc Collects the hardcoded featured themes array from the storage.js module.
 * Then uses this.getPackageCollectionByName to retrieve details of the package.
 * @returns {object} A server status object.
 */
const storage = require("../storage.js");
const getPackageCollectionByName =
  require("./getPackageCollectionByName.js").exec;

module.exports = {
  safe: false,
  exec: async (sql) => {
    let featuredThemeArray = await storage.getFeaturedThemes();

    if (!featuredThemeArray.ok) {
      return featuredThemeArray;
    }

    return await getPackageCollectionByName(sql, featuredThemeArray.content);
  },
};

/**
 * @async
 * @function getFeaturedPackages
 * @desc Collects the hardcoded featured packages array from the storage.js
 * module. Then uses this.getPackageCollectionByName to retrieve details of the
 * package.
 * @returns {object} A server status object.
 */

const storage = require("../storage.js");
const getPackageCollectionByName = require("./getPackageCollectionByName.js").exec;

module.exports = {
  safe: false,
  exec: async (sql) => {
    let featuredArray = await storage.getFeaturedPackages();

    if (!featuredArray.ok) {
      return featuredArray;
    }

    return await getPackageCollectionByName(sql, featuredArray.content);
  }
};

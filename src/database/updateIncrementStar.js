/**
 * @async
 * @function updateIncrementStar
 * @description Register the star given by a user to a package.
 * @param {int} user - A User Object that should star the package.
 * @param {string} pack - Package name that get the new star.
 * @returns {object} A server status object.
 */

const getPackageByNameSimple = require("./getPackageByNameSimple.js").exec;
const updatePackageStargazers = require("./updatePackageStargazers.js").exec;

module.exports = {
  safe: false,
  exec: async (sql, user, pack) => {
    const packID = await getPackageByNameSimple(sql, pack);

    if (!packID.ok) {
      return {
        ok: false,
        content: `Unable to find package ${pack} to star.`,
        short: "not_found",
      };
    }

    const pointer = packID.content.pointer;

    try {
      const commandStar = await sql`
        INSERT INTO stars
        (package, userid) VALUES
        (${pointer}, ${user.id})
        RETURNING *;
      `;

      // Now we expect to get our data right back, and can check the
      // validity to know if this happened successfully or not.
      if (
        pointer !== commandStar[0].package ||
        user.id !== commandStar[0].userid
      ) {
        return {
          ok: false,
          content: `Failed to Star the Package`,
          short: "server_error",
        };
      }

      // Now update the stargazers count into the packages table
      const updatePack = await updatePackageStargazers(sql, pack, pointer);

      if (!updatePack.ok) {
        return updatePack;
      }

      return {
        ok: true,
        content: `Package Successfully Starred`,
      };
    } catch (e) {
      // TODO: While the comment below is accurate
      // It's also worth noting that this catch will return success
      // If the starring user does not exist. Resulting in a false positive
      // Catch the primary key violation on (package, userid),
      // Sinche the package is already starred by the user, we return ok.
      return {
        ok: true,
        content: `Package Already Starred`,
      };
    }
  }
};

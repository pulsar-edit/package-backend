/**
 * @async
 * @function updateDecrementStar
 * @description Register the removal of the star on a package by a user.
 * @param {int} user - User Object who remove the star.
 * @param {string} pack - Package name that get the star removed.
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
        content: `Unable to find package ${pack} to unstar.`,
        short: "not_found",
      };
    }

    const pointer = packID.content.pointer;

    const commandUnstar = await sql`
      DELETE FROM stars
      WHERE (package = ${pointer}) AND (userid = ${user.id})
      RETURNING *;
    `;

    if (commandUnstar.count === 0) {
      // We know user and package exist both, so the fail is because
      // the star was already missing,
      // The user expects its star is not given, so we return ok.
      return {
        ok: true,
        content: "The Star is Already Missing",
      };
    }

    // If the return does not match our input, it failed.
    if (
      user.id !== commandUnstar[0].userid ||
      pointer !== commandUnstar[0].package
    ) {
      return {
        ok: false,
        content: "Failed to Unstar the Package",
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
      content: "Package Successfully Unstarred",
    };
  }
};

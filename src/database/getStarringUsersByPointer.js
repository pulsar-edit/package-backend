/**
 * @async
 * @function getStarringUsersByPointer
 * @description Use the pointer of a package to collect all users that have starred it.
 * @param {string} pointer - The ID of the package.
 * @returns {object} A server status object.
 */

const logger = require("../logger.js");

module.exports = {
  safe: false,
  exec: async (sql, pointer) => {
    const command = await sql`
      SELECT ARRAY (
        SELECT userid FROM stars WHERE package = ${pointer.pointer}
      );
    `;

    let userArray = command[0].array;

    if (command.count === 0) {
      // It is likely safe to assume that if nothing matches the packagepointer,
      // then the package pointer has no stars. So instead of server error
      // here we will non-traditionally return an empty array.
      logger.generic(
        3,
        `No Stars for ${pointer} found, assuming 0 star value.`
      );
      userArray = [];
    }

    return { ok: true, content: userArray };
  }
};

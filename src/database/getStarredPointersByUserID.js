/**
 * @async
 * @function getStarredPointersByUserID
 * @description Get all packages which the user gave the star.
 * The result of this function should not be returned to the user because it contains pointers UUID.
 * @param {int} userid - ID of the user.
 * @returns {object} A server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, userid) => {
    const command = await sql`
      SELECT ARRAY (
        SELECT package FROM stars WHERE userid = ${userid}
      );
    `;

    // It is likely safe to assume that if nothing matches the userid,
    // then the user hasn't given any star. So instead of server error
    // here we will non-traditionally return an empty array.
    const packArray =
      command.count !== 0 && Array.isArray(command[0].array)
        ? command[0].array
        : [];

    return { ok: true, content: packArray };
  }
};

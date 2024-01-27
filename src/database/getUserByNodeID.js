/**
 * @async
 * @function getUserByNodeID
 * @description Get user details providing their Node ID.
 * @param {string} id - Users Node ID.
 * @returns {object} A server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, id) => {
    const command = await sql`
      SELECT * FROM users
      WHERE node_id = ${id};
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: `Unable to get User By NODE_ID: ${id}`,
        short: "not_found",
      };
    }

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to get User By NODE_ID: ${id}`,
          short: "server_error",
        };
  },
};

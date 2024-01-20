/**
 * @async
 * @function insertNewUser
 * @desc Insert a new user into the database.
 * @param {string} username - Username of the user.
 * @param {object} id - Identifier code of the user.
 * @param {object} avatar - The avatar of the user.
 * @returns {object} A server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, username, id, avatar) => {
    const command = await sql`
      INSERT INTO users (username, node_id, avatar)
      VALUES (${username}, ${id}, ${avatar})
      RETURNING *;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to create user: ${username}`,
          short: "Server Error",
        };
  }
};

/**
 * @async
 * @function getUserByID
 * @desc Get user details providing their ID.
 * @param {int} id - User ID
 * @returns {object} A Server status Object.
 */

module.exports = {
  safe: false,
  exec: async (sql, id) => {
    const command = await sql`
      SELECT * FROM users
      WHERE id = ${id};
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: `Unable to get user by ID: ${id}`,
        short: "server_error",
      };
    }

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to get user by ID: ${id}`,
          short: "server_error",
        };
  },
};

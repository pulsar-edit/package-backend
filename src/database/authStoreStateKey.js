/**
 * @async
 * @function authStoreStateKey
 * @desc Gets a state key from login process and saves it on the database.
 * @param {string} stateKey - The key code string.
 * @returns {object} A server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, stateKey) => {
    const command = await sql`
      INSERT INTO authstate (keycode)
      VALUES (${stateKey})
      RETURNING keycode;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0].keycode }
      : {
          ok: false,
          content: `The state key has not been saved on the database.`,
          short: "server_error",
        };
  }
};

/**
 * @async
 * @function authCheckAndDeleteStateKey
 * @desc Gets a state key from oauth process and delete it from the database.
 * It's used to verify if the request for the authentication is valid. The code should be first generated in the
 * initial stage of the login and then deleted by this function.
 * If the deletion is successful, the returned record is used to retrieve the created timestamp of the state key
 * and check if it's not expired (considering a specific timeout).
 * A custom timestamp can be passed as argument for testing purpose, otherwise the current timestamp is considered.
 * @param {string} stateKey - The key code string to delete.
 * @param {string} timestamp - A string in SQL timestamp format to check against the created timestamp of the
 * given state key. If not provided, the current UNIX timestamp is used.
 * @returns {object} A server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, stateKey, timestamp = null) => {
    // We need to compare the created timestamp with Date.now() timestamp which
    // is returned in milliseconds.
    // We convert the created SQL timestamp to UNIX timestamp which has an
    // high resolution up to microseconds, but it's returned in seconds with a
    // fractional part.
    // So we first convert it to milliseconds, then cast to BIGINT to remove the
    // unneeded remaining fractional part.
    // BIGINT has to be used because ms UNIX timestamp does not fit into
    // PostgreSQL INT type.
    const command = await sql`
      DELETE FROM authstate
      WHERE keycode = ${stateKey}
      RETURNING keycode, CAST(extract(epoch from created) * 1000 AS BIGINT) AS created;
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: "The provided state key was not set for the auth login.",
        short: "not_found",
      };
    }

    const created = BigInt(command[0].created);
    const timeout = 600000n; // 10*60*1000 => 10 minutes in ms
    const now = timestamp ?? Date.now();

    if (now > created + timeout) {
      return {
        ok: false,
        content: "The provided state key is expired for the auth login.",
        short: "not_found",
      };
    }

    return { ok: true, content: command[0].keycode };
  },
};

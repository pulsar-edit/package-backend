/**
 * @async
 * @function getPackageByNameSimple
 * @desc Internal util used by other functions in this module to get the package row by the given name.
 * It's like getPackageByName(), but with a simple and faster query.
 * @param {string} name - The name of the package.
 * @returns {object} A server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, name) => {
    const command = await sql`
      SELECT pointer FROM names
      WHERE name = ${name};
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Package ${name} not found.`,
          short: "not_found",
        };
  }
};

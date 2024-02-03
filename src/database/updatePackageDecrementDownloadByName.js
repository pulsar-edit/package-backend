/**
 * @async
 * @function updatePackageDecrementDownloadByName
 * @description Uses the package name to decrement the download count by one.
 * @param {string} name - The package name.
 * @returns {object} The modified server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, name) => {
    const command = await sql`
      UPDATE packages AS p
      SET downloads = GREATEST(p.downloads - 1, 0)
      FROM names AS n
      WHERE n.pointer = p.pointer AND n.name = ${name}
      RETURNING p.name, p.downloads;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: "Unable to decrement Package Download Count",
          short: "server_error",
        };
  },
};

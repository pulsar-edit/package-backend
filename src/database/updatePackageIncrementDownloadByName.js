/**
 * @async
 * @function updatePackageIncrementDownloadByName
 * @description Uses the package name to increment the download count by one.
 * @param {string} name - The package name.
 * @returns {object} The modified server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, name) => {
    const command = await sql`
      UPDATE packages AS p
      SET downloads = p.downloads + 1
      FROM names AS n
      WHERE n.pointer = p.pointer AND n.name = ${name}
      RETURNING p.name, p.downloads;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: "Unable to Update Package Download",
          short: "Server Error",
        };
  },
};

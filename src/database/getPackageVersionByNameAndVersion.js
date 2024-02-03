/**
 * @async
 * @function getPackageVersionByNameAndVersion
 * @desc Uses the name of a package and it's version to return the version info.
 * @param {string} name - The name of the package to query.
 * @param {string} version - The version of the package to query.
 * @returns {object} A server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, name, version) => {
    const command = await sql`
      SELECT v.semver, v.license, v.engine, v.meta
      FROM packages AS p
        INNER JOIN names AS n ON (p.pointer = n.pointer AND n.name = ${name})
        INNER JOIN versions AS v ON (p.pointer = v.package AND v.semver = ${version} AND v.deleted IS FALSE);
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Package ${name} and Version ${version} not found.`,
          short: "not_found",
        };
  },
};

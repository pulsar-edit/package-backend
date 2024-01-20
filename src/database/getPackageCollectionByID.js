/**
 * @async
 * @function getPackageCollectionByID
 * @desc Takes a package pointer array, and returns an array of the package objects.
 * @param {int[]} packArray - An array of package id.
 * @returns {object} A server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, packArray) => {
    const command = await sql`
      SELECT DISTINCT ON (p.name) p.name, v.semver, p.downloads,
        (p.stargazers_count + p.original_stargazers) AS stargazers_count, p.data
      FROM packages AS p
        INNER JOIN versions AS v ON (p.pointer = v.package AND v.deleted IS FALSE)
      WHERE pointer IN ${sql(packArray)}
      ORDER BY p.name, v.semver_v1 DESC, v.semver_v2 DESC, v.semver_v3 DESC, v.created DESC;
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : { ok: false, content: "No packages found.", short: "Not Found" };
  }
};

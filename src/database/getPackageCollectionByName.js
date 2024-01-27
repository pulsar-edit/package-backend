/**
 * @async
 * @function getPackageCollectionByName
 * @desc Takes a package name array, and returns an array of the package objects.
 * You must ensure that the packArray passed is compatible. This function does not coerce compatibility.
 * @param {string[]} packArray - An array of package name strings.
 * @returns {object} A server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, packArray) => {
    // Since this function is invoked by getFeaturedThemes and getFeaturedPackages
    // which process the returned content with constructPackageObjectShort(),
    // we select only the needed columns.
    const command = await sql`
      SELECT DISTINCT ON (p.name) p.name, v.semver, p.downloads, p.owner,
        (p.stargazers_count + p.original_stargazers) AS stargazers_count, p.data
      FROM packages AS p
        INNER JOIN names AS n ON (p.pointer = n.pointer AND n.name IN ${sql(
          packArray
        )})
        INNER JOIN versions AS v ON (p.pointer = v.package AND v.deleted IS FALSE)
      ORDER BY p.name, v.semver_v1 DESC, v.semver_v2 DESC, v.semver_v3 DESC, v.created DESC;
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : { ok: false, content: "No packages found.", short: "not_found" };
  }
};

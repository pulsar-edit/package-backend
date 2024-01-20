/**
 * @async
 * @function updatePackageStargazers
 * @description Internal util that uses the package name (or pointer if provided) to update its stargazers count.
 * @param {string} name - The package name.
 * @param {string} pointer - The package id (if given, the search by name is skipped).
 * @returns {object} The effected server status object.
 */

const getPackageByNameSimple = require("./getPackageByNameSimple.js");

module.exports = {
  safe: false,
  exec: async (sql, name, pointer = null) => {
    if (pointer === null) {
      const packID = await getPackageByNameSimple(sql, name);

      if (!packID.ok) {
        return packID;
      }

      pointer = packID.content.pointer;
    }

    const countStars = await sql`
      SELECT COUNT(*) AS stars
      FROM stars
      WHERE package = ${pointer};
    `;

    const starCount = countStars.count !== 0 ? countStars[0].stars : 0;

    const updateStar = await sql`
      UPDATE packages
      SET stargazers_count = ${starCount}
      WHERE pointer = ${pointer}
      RETURNING name, (stargazers_count + original_stargazers) AS stargazers_count;
    `;

    return updateStar.count !== 0
      ? { ok: true, content: updateStar[0] }
      : {
          ok: false,
          content: "Unable to Update Package Stargazers",
          short: "server_error",
        };
  }
};

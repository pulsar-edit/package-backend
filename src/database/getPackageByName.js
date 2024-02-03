/**
 * @async
 * @function getPackageByName
 * @desc Takes a package name and returns the raw SQL package with all its versions.
 * This module is also used to get the data to be sent to utils.constructPackageObjectFull()
 * in order to convert the query result in Package Object Full format.
 * In that case it's recommended to set the user flag as true for security reasons.
 * @param {string} name - The name of the package.
 * @param {bool} user - Whether the packages has to be exposed outside or not.
 * If true, all sensitive data like primary and foreign keys are not selected.
 * Even if the keys are ignored by utils.constructPackageObjectFull(), it's still
 * safe to not inclue them in case, by mistake, we publish the return of this module.
 * @returns {object} A server status object.
 */

module.exports = {
  safe: false,
  exec: async (sql, name, user = false) => {
    const command = await sql`
      SELECT
        ${
          user ? sql`` : sql`p.pointer,`
        } p.name, p.created, p.updated, p.creation_method, p.downloads, p.data, p.owner,
        (p.stargazers_count + p.original_stargazers) AS stargazers_count,
        JSONB_AGG(
          JSON_BUILD_OBJECT(
            ${
              user ? sql`` : sql`'id', v.id, 'package', v.package,`
            } 'semver', v.semver, 'license', v.license, 'engine', v.engine, 'meta', v.meta,
            'hasGrammar', v.has_grammar, 'hasSnippets', v.has_snippets,
            'supportedLanguages', v.supported_languages
          )
          ORDER BY v.semver_v1 DESC, v.semver_v2 DESC, v.semver_v3 DESC, v.created DESC
        ) AS versions
      FROM packages AS p
        INNER JOIN names AS n ON (p.pointer = n.pointer AND n.name = ${name})
        INNER JOIN versions AS v ON (p.pointer = v.package AND v.deleted IS FALSE)
      GROUP BY p.pointer;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `package ${name} not found.`,
          short: "not_found",
        };
  },
};

/**
 * @async
 * @function removePackageVersion
 * @description Mark a version of a specific package as deleted. This does not delete the record,
 * just mark the boolean deleted flag as true, but only if one published version remains available.
 * This also makes sure that a new latest version is selected in case the previous one is removed.
 * @param {string} packName - The package name.
 * @param {string} semVer - The version to remove.
 * @returns {object} A server status object.
 */

const getPackageByNameSimple = require("./getPackageByNameSimple.js").exec;

module.exports = {
  safe: false,
  exec: async (sql, packName, semVer) => {
    return await sql
      .begin(async (sqlTrans) => {
        // Retrieve the package pointer
        const packID = await getPackageByNameSimple(sql, packName);

        if (!packID.ok) {
          // Return Not Found
          return {
            ok: false,
            content: `Unable to find the pointer of ${packName}`,
            short: "not_found",
          };
        }

        const pointer = packID.content.pointer;

        // Retrieve all non-removed versions to count them
        const getVersions = await sqlTrans`
          SELECT id
          FROM versions
          WHERE package = ${pointer} AND deleted IS FALSE;
        `;

        const versionCount = getVersions.count;
        if (versionCount < 2) {
          throw `${packName} package has less than 2 published versions: deletion not allowed.`;
        }

        // We can remove the targeted semVer.
        const markDeletedVersion = await sqlTrans`
          UPDATE versions
          SET DELETED = TRUE
          WHERE package = ${pointer} AND semver = ${semVer}
          RETURNING id;
        `;

        if (markDeletedVersion.count === 0) {
          // Do not use throw here because we specify Not Found reason.
          return {
            ok: false,
            content: `Unable to remove ${semVer} version of ${packName} package.`,
            short: "not_found",
          };
        }

        return {
          ok: true,
          content: `Successfully removed ${semVer} version of ${packName} package.`,
        };
      })
      .catch((err) => {
        return typeof err === "string"
          ? { ok: false, content: err, short: "server_error" }
          : {
              ok: false,
              content: `A generic error occurred while inserting ${packName} package`,
              short: "server_error",
              error: err,
            };
      });
  },
};

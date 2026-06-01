/**
 * @async
 * @function updatePackageIncrementDownloadByName
 * @description Uses the package name to increment the download count by one.
 * @param {string} name - The package name.
 * @returns {object} The modified server status object.
 */

const getPackageByName = require("./getPackageByName.js").exec;

module.exports = {
  safe: false,
  exec: async (sql, name) => {

    return await sql
      .begin(async (sqlTrans) => {
        // Modify package global download count
        let dwnCount = {};
        try {
          dwnCount = await sqlTrans`
            UPDATE packages AS p
            SET downloads = p.downloads + 1
            FROM names AS n
            WHERE n.pointer = p.pointer AND n.name = ${name}
            RETURNING p.name, p.downloads;
          `;
        } catch(e) {
          throw `A constraint has been violated while updating global download count of '${name}'`;
        }

        if (!dwnCount.count) {
          throw `Cannot update global download count of '${name}'`;
        }

        let dailyDwnCount = {};
        try {
          const pack = await getPackageByName(sql, name);

          if (!pack.ok) {
            return pack;
          }

          dailyDwnCount = await sqlTrans`
            INSERT INTO package_downloads_daily (pointer, download_date, downloads)
            VALUES(${pack.content.pointer}, CURRENT_DATE, 1)
            ON CONFLICT (pointer, download_date)
            DO UPDATE SET download_count = package_downloads_daily.download_count + 1;
          `;
        } catch(e) {
          throw `A constraint has been violated while updating daily download count of '${name}'`;
        }

        if (!dailyDwnCount.count) {
          throw `Cannot update daily download count of '${name}'`;
        }

        return {
          ok: true,
          content: dwnCount[0]
        };
      })
      .catch((err) => {
        return typeof err === "string"
          ? { ok: false, content: err, short: "server_error" }
          : {
              ok: false,
              content: `A generic error occurred while updating the download count for ${name}`,
              short: "server_error",
              error: err
            };
      });
  },
};

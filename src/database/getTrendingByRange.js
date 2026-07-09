/**
 * @async
 * @function getTrendingByRange
 * @description Get trending packages, according to downloads, based on a specified range.
 * @param {string} range
 * @returns {object} A server status object
*/

const { paginated_amount } = require("../config.js").getConfig();

module.exports = {
  safe: true,
  exec: async (sql, range = "7 days") => {
    // TODO: Implement sanitizing of range here? Or should we trust endpoint APIs will do it well enough?

    const command = await sql`
      SELECT pointer, SUM(download_count) AS total_downloads
      FROM package_downloads_daily
      WHERE download_date >= CURRENT_DATE - INTERVAL ${range}
      GROUP BY pointer
      ORDER BY total_downloads DESC
      LIMIT ${paginated_amount};
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to determine trending for '${range}'`,
          short: "server_error"
        };
  },
};

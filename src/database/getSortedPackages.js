/**
 * @async
 * @function getSortedPackages
 * @desc Takes the page, direction, and sort method returning the raw sql package
 * data for each. This monolithic function handles trunication of the packages,
 * and sorting, aiming to provide back the raw data, and allow later functions to
 * then reconstruct the JSON as needed.
 * @param {int} page - Page number.
 * @param {string} dir - String flag for asc/desc order.
 * @param {string} method - The sort method.
 * @param {boolean} [themes=false] - Optional Parameter to specify if this should only return themes.
 * @returns {object} A server status object containing the results and the pagination object.
 */

const clause = require("./_clause.js");
const utils = require("./_utils.js");
const logger = require("../logger.js");
const { paginated_amount } = require("../config.js").getConfig();

module.exports = {
  safe: false,
  exec: async (sql, opts, themes = false) => {
    // Here will be a monolithic function for returning sortable packages arrays.
    // We must keep in mind that all the endpoint handler knows is the
    // page, sort method, and direction. We must figure out the rest here.
    // only knowing we have a valid sort method provided.

    const limit = paginated_amount;
    const offset = opts.page > 1 ? (opts.page - 1) * limit : 0;

    const orderType = utils.getOrderField(opts.sort, sql);

    if (orderType === null) {
      logger.generic(3, `Unrecognized Sorting Method Provided: ${opts.sort}`);
      return {
        ok: false,
        content: `Unrecognized Sorting Method Provided: ${opts.sort}`,
        short: "Server Error",
      };
    }

    const command = await sql`
      WITH latest_versions AS (
        SELECT DISTINCT ON (p.name) p.name, p.data, p.downloads, p.owner,
          (p.stargazers_count + p.original_stargazers) AS stargazers_count,
          v.semver, p.created, v.updated, p.creation_method
        FROM packages AS p
          INNER JOIN versions AS v ON (p.pointer = v.package AND v.deleted IS FALSE
          ${clause.queryClause(sql, opts)}
          ${clause.filterClause(sql, opts)}
          ${themes === true ? clause.filterClause(sql, { filter: "theme" }) : sql``})

        WHERE p.name IS NOT NULL

        ${clause.serviceClause(sql, opts)}
        ${clause.fileExtensionClause(sql, opts)}
        ${clause.ownerClause(sql, opts)}

        ORDER BY p.name, v.semver_v1 DESC, v.semver_v2 DESC, v.semver_v3 DESC, v.created DESC
      )
      SELECT *, COUNT(*) OVER() AS query_result_count
      FROM latest_versions
      ORDER BY ${orderType} ${
      opts.direction === "desc" ? sql`DESC` : sql`ASC`
    }
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    const resultCount = command[0]?.query_result_count ?? 0;
    const quotient = Math.trunc(resultCount / limit);
    const remainder = resultCount % limit;
    const totalPages = quotient + (remainder > 0 ? 1 : 0);

    return {
      ok: true,
      content: command,
      pagination: {
        count: resultCount,
        page: opts.page < totalPages ? opts.page : totalPages,
        total: totalPages,
        limit,
      },
    };
  }
};

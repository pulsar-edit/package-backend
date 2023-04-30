/**
 * @module theme_handler
 * @desc Endpoint Handlers relating to themes only.
 * @implements {database}
 * @implements {utils}
 * @implements {logger}
 * @implements {config}
 */

const utils = require("../utils.js");
const logger = require("../logger.js");
const { server_url } = require("../config.js").getConfig();

/**
 * @async
 * @function getThemeFeatured
 * @desc Used to retrieve all Featured Packages that are Themes. Originally an undocumented
 * endpoint. Returns a 200 response based on other similar responses.
 * Additionally for the time being this list is created manually, the same method used
 * on Atom.io for now. Although there are plans to have this become automatic later on.
 * @see {@link https://github.com/atom/apm/blob/master/src/featured.coffee|Source Code}
 * @see {@link https://github.com/confused-Techie/atom-community-server-backend-JS/issues/23|Discussion}
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/themes/featured
 */
async function getThemeFeatured(db) {
  // Returns Package Object Short Array

  let col = await db.getFeaturedThemes();

  if (!col.ok) {
    return {
      ok: false,
      content: col
    };
  }

  let newCol = await utils.constructPackageObjectShort(col.content);

  return {
    ok: true,
    content: newCol
  };
}

/**
 * @async
 * @function getThemes
 * @desc Endpoint to return all Themes to the user. Based on any filtering
 * they'ved applied via query parameters.
 * @param {object} params - The query parameters that can operate on this endpoint.
 * @param {integer} params.page - The page of results to retreive.
 * @param {string} params.sort - The sort method to use.
 * @param {string} params.direction - The direction to sort results.
 * @returns {object} An HTTP ServerStatus.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/themes
 */
async function getThemes(params, db) {

  const packages = await db.getSortedPackages(params, true);

  if (!packages.ok) {
    logger.generic(
      3,
      `getThemes-getSortedPackages Not OK: ${packages.content}`
    );
    return {
      ok: false,
      content: packages
    };

  }

  const page = packages.pagination.page;
  const totPage = packages.pagination.total;
  const packObjShort = await utils.constructPackageObjectShort(
    packages.content
  );

  const packArray = Array.isArray(packObjShort) ? packObjShort : [packObjShort];

  let link = `<${server_url}/api/themes?page=${page}&sort=${params.sort}&order=${params.direction}>; rel="self", <${server_url}/api/themes?page=${totPage}&sort=${params.sort}&order=${params.direction}>; rel="last"`;

  if (page !== totPage) {
    link += `, <${server_url}/api/themes?page=${page + 1}&sort=${
      params.sort
    }&order=${params.direction}>; rel="next"`;
  }

  return {
    ok: true,
    link: link,
    total: packages.pagination.count,
    limit: packages.pagination.limit,
    content: packArray
  };

}

/**
 * @async
 * @function getThemesSearch
 * @desc Endpoint to Search from all themes on the registry.
 * @param {object} params - The query parameters from the initial request.
 * @param {integer} params.page - The page number to return
 * @param {string} params.sort - The method to use to sort
 * @param {string} params.direction - The direction to sort
 * @param {string} params.query - The search query to use
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/themes/search
 */
async function getThemesSearch(params, db) {

  const packs = await db.simpleSearch(
    params.query,
    params.page,
    params.direction,
    params.sort,
    true
  );

  if (!packs.ok) {
    if (packs.short === "Not Found") {
      logger.generic(
        4,
        "getThemesSearch-simpleSearch Responding with Empty Array for Not Found Status"
      );
      return {
        ok: true,
        content: [],
        link: "",
        total: 0,
        limit: 0
      };
    }

    logger.generic(3, `getThemesSearch-simpleSearch Not OK: ${packs.content}`);
    return {
      ok: false,
      content: packs
    };
  }

  const page = packs.pagination.page;
  const totPage = packs.pagination.total;
  const newPacks = await utils.constructPackageObjectShort(packs.content);

  let packArray = null;

  if (Array.isArray(newPacks)) {
    packArray = newPacks;
  } else if (Object.keys(newPacks).length < 1) {
    packArray = [];
    logger.generic(
      4,
      "getThemesSearch-simpleSearch Responding with Empty Array for 0 key Length Object"
    );
  } else {
    packArray = [newPacks];
  }

  const safeQuery = encodeURIComponent(
    params.query.replace(/[<>"':;\\/]+/g, "")
  );
  // now to get headers.
  let link = `<${server_url}/api/themes/search?q=${safeQuery}&page=${page}&sort=${params.sort}&order=${params.direction}>; rel="self", <${server_url}/api/themes/search?q=${safeQuery}&page=${totPage}&sort=${params.sort}&order=${params.direction}>; rel="last"`;

  if (page !== totPage) {
    link += `, <${server_url}/api/themes/search?q=${safeQuery}&page=${
      page + 1
    }&sort=${params.sort}&order=${params.direction}>; rel="next"`;
  }

  return {
    ok: true,
    content: packArray,
    link: link,
    total: packs.pagination.count,
    limit: packs.pagination.limit
  };

}

module.exports = {
  getThemeFeatured,
  getThemes,
  getThemesSearch,
};

/**
 * @module get_package_handler
 * @desc Endpoint Handlers for every GET Request that relates to packages themselves
 */

const common = require("./common_handler.js");
const query = require("../query.js");
const logger = require("../logger.js");
const { server_url } = require("../config.js").getConfig();
const utils = require("../utils.js");
const database = require("../database.js");
const { URL } = require("node:url");

/**
 * @async
 * @function getPackages
 * @desc Endpoint to return all packages to the user. Based on any filtering
 * theyved applied via query parameters.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages
 */
async function getPackages(req, res) {
  const params = {
    page: query.page(req),
    sort: query.sort(req),
    direction: query.dir(req),
    serviceType: query.serviceType(req),
    service: query.service(req),
    serviceVersion: query.serviceVersion(req)
  };

  const packages = await database.getSortedPackages(params);

  if (!packages.ok) {
    logger.generic(
      3,
      `getPackages-getSortedPackages Not OK: ${packages.content}`
    );
    await common.handleError(req, res, packages, 1001);
    return;
  }

  const page = packages.pagination.page;
  const totPage = packages.pagination.total;
  const packObjShort = await utils.constructPackageObjectShort(
    packages.content
  );

  // The endpoint using this function needs an array.
  const packArray = Array.isArray(packObjShort) ? packObjShort : [packObjShort];

  let link = `<${server_url}/api/packages?page=${page}&sort=${params.sort}&order=${params.direction}>; rel="self", <${server_url}/api/packages?page=${totPage}&sort=${params.sort}&order=${params.direction}>; rel="last"`;

  if (page !== totPage) {
    link += `, <${server_url}/api/packages?page=${page + 1}&sort=${
      params.sort
    }&order=${params.direction}>; rel="next"`;
  }

  res.append("Link", link);
  res.append("Query-Total", packages.pagination.count);
  res.append("Query-Limit", packages.pagination.limit);

  res.status(200).json(packArray);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getPackagesFeatured
 * @desc Allows the user to retrieve the featured packages, as package object shorts.
 * This endpoint was originally undocumented. The decision to return 200 is based off similar endpoints.
 * Additionally for the time being this list is created manually, the same method used
 * on Atom.io for now. Although there are plans to have this become automatic later on.
 * @see {@link https://github.com/atom/apm/blob/master/src/featured.coffee|Source Code}
 * @see {@link https://github.com/confused-Techie/atom-community-server-backend-JS/issues/23|Discussion}
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/featured
 */
async function getPackagesFeatured(req, res) {
  // Returns Package Object Short array.
  // Supports engine query parameter.
  const packs = await database.getFeaturedPackages();

  if (!packs.ok) {
    logger.generic(
      3,
      `getPackagesFeatured-getFeaturedPackages Not OK: ${packs.content}`
    );
    await common.handleError(req, res, packs, 1003);
    return;
  }

  const packObjShort = await utils.constructPackageObjectShort(packs.content);

  // The endpoint using this function needs an array.
  const packArray = Array.isArray(packObjShort) ? packObjShort : [packObjShort];

  res.status(200).json(packArray);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getPackagesSearch
 * @desc Allows user to search through all packages. Using their specified
 * query parameter.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/search
 * @todo Note: This **has** been migrated to the new DB, and is fully functional.
 * The TODO here is to eventually move this to use the custom built in LCS search,
 * rather than simple search.
 */
async function getPackagesSearch(req, res) {
  const params = {
    sort: query.sort(req),
    page: query.page(req),
    direction: query.dir(req),
    query: query.query(req),
  };

  // Because the task of implementing the custom search engine is taking longer
  // than expected, this will instead use super basic text searching on the DB side.
  // This is only an effort to get this working quickly and should be changed later.
  // This also means for now, the default sorting method will be downloads, not relevance.

  const packs = await database.simpleSearch(
    params.query,
    params.page,
    params.direction,
    params.sort
  );

  if (!packs.ok) {
    if (packs.short === "Not Found") {
      logger.generic(
        4,
        "getPackagesSearch-simpleSearch Responding with Empty Array for Not Found Status"
      );
      // Because getting not found from the search, means the users
      // search just had no matches, we will specially handle this to return
      // an empty array instead.
      res.status(200).json([]);
      logger.httpLog(req, res);
      return;
    }
    logger.generic(
      3,
      `getPackagesSearch-simpleSearch Not OK: ${packs.content}`
    );
    await common.handleError(req, res, packs, 1007);
    return;
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
      "getPackagesSearch-simpleSearch Responding with Empty Array for 0 Key Length Object"
    );
    // This also helps protect against misreturned searches. As in getting a 404 rather
    // than empty search results.
    // See: https://github.com/confused-Techie/atom-backend/issues/59
  } else {
    packArray = [newPacks];
  }

  const safeQuery = encodeURIComponent(
    params.query.replace(/[<>"':;\\/]+/g, "")
  );
  // now to get headers.
  let link = `<${server_url}/api/packages/search?q=${safeQuery}&page=${page}&sort=${params.sort}&order=${params.direction}>; rel="self", <${server_url}/api/packages/search?q=${safeQuery}&page=${totPage}&sort=${params.sort}&order=${params.direction}>; rel="last"`;

  if (page !== totPage) {
    link += `, <${server_url}/api/packages/search?q=${safeQuery}&page=${
      page + 1
    }&sort=${params.sort}&order=${params.direction}>; rel="next"`;
  }

  res.append("Link", link);
  res.append("Query-Total", packs.pagination.count);
  res.append("Query-Limit", packs.pagination.limit);

  res.status(200).json(packArray);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getPackagesDetails
 * @desc Allows the user to request a single package object full, depending
 * on the package included in the path parameter.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/:packageName
 */
async function getPackagesDetails(req, res) {
  const params = {
    engine: query.engine(req.query.engine),
    name: query.packageName(req),
  };
  let pack = await database.getPackageByName(params.name, true);

  if (!pack.ok) {
    logger.generic(
      3,
      `getPackagesDetails-getPackageByName Not OK: ${pack.content}`
    );
    await common.handleError(req, res, pack, 1004);
    return;
  }

  pack = await utils.constructPackageObjectFull(pack.content);

  if (params.engine !== false) {
    // query.engine returns false if no valid query param is found.
    // before using engineFilter we need to check the truthiness of it.
    pack = await utils.engineFilter(pack, params.engine);
  }

  res.status(200).json(pack);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getPackagesStargazers
 * @desc Endpoint returns the array of `star_gazers` from a specified package.
 * Taking only the package wanted, and returning it directly.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/:packageName/stargazers
 */
async function getPackagesStargazers(req, res) {
  const params = {
    packageName: query.packageName(req),
  };
  // The following can't be executed in user mode because we need the pointer
  const pack = await database.getPackageByName(params.packageName);

  if (!pack.ok) {
    await common.handleError(req, res, pack);
    return;
  }

  const stars = await database.getStarringUsersByPointer(pack.content);

  if (!stars.ok) {
    await common.handleError(req, res, stars);
    return;
  }

  const gazers = await database.getUserCollectionById(stars.content);

  if (!gazers.ok) {
    await common.handleError(req, res, gazers);
    return;
  }

  res.status(200).json(gazers.content);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getPackagesVersion
 * @desc Used to retrieve a specific version from a package.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/:packageName/versions/:versionName
 */
async function getPackagesVersion(req, res) {
  const params = {
    packageName: query.packageName(req),
    versionName: query.engine(req.params.versionName),
  };
  // Check the truthiness of the returned query engine.
  if (params.versionName === false) {
    // we return a 404 for the version, since its an invalid format
    await common.notFound(req, res);
    return;
  }
  // Now we know the version is a valid semver.

  const pack = await database.getPackageVersionByNameAndVersion(
    params.packageName,
    params.versionName
  );

  if (!pack.ok) {
    await common.handleError(req, res, pack);
    return;
  }

  const packRes = await utils.constructPackageObjectJSON(pack.content);

  res.status(200).json(packRes);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getPackagesVersionTarball
 * @desc Allows the user to get the tarball for a specific package version.
 * Which should initiate a download of said tarball on their end.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/:packageName/versions/:versionName/tarball
 */
async function getPackagesVersionTarball(req, res) {
  const params = {
    packageName: query.packageName(req),
    versionName: query.engine(req.params.versionName),
  };
  // Now that migration has began we know that each version will have
  // a tarball_url key on it, linking directly to the tarball from gh for that version.

  // we initially want to ensure we have a valid version.
  if (params.versionName === false) {
    // since query.engine gives false if invalid, we can just check if its truthy
    // additionally if its false, we know the version will never be found.
    await common.notFound(req, res);
    return;
  }

  // first lets get the package
  const pack = await database.getPackageVersionByNameAndVersion(
    params.packageName,
    params.versionName
  );

  if (!pack.ok) {
    await common.handleError(req, res, pack);
    return;
  }

  const save = await database.updatePackageIncrementDownloadByName(
    params.packageName
  );

  if (!save.ok) {
    logger.generic(3, "Failed to Update Downloads Count", {
      type: "object",
      obj: save.content,
    });
    logger.generic(3, "Failed to Update Downloads Count", {
      type: "http",
      req: req,
      res: res,
    });
    // we don't want to exit on a failed to update downloads count, but should be logged.
  }

  // For simplicity, we will redirect the request to gh tarball url, to allow
  // the download to take place from their servers.

  // But right before, lets do a couple simple checks to make sure we are sending to a legit site.
  const tarballURL =
    pack.content.meta?.tarball_url ?? pack.content.meta?.dist?.tarball ?? "";
  let hostname = "";

  // Try to extract the hostname
  try {
    const tbUrl = new URL(tarballURL);
    hostname = tbUrl.hostname;
  } catch (e) {
    logger.generic(
      3,
      `Malformed tarball URL for version ${params.versionName} of ${params.packageName}`
    );
    await common.handleError(req, res, {
      ok: false,
      short: "Server Error",
      content: e,
    });
    return;
  }

  const allowedHostnames = [
    "codeload.github.com",
    "api.github.com",
    "github.com",
    "raw.githubusercontent.com",
  ];

  if (
    !allowedHostnames.includes(hostname) &&
    process.env.PULSAR_STATUS !== "dev"
  ) {
    await common.handleError(req, res, {
      ok: false,
      short: "Server Error",
      content: `Invalid Domain for Download Redirect: ${hostname}`,
    });
    return;
  }

  res.redirect(tarballURL);
  logger.httpLog(req, res);
  return;
}

module.exports = {
  getPackages,
  getPackagesFeatured,
  getPackagesSearch,
  getPackagesDetails,
  getPackagesStargazers,
  getPackagesVersion,
  getPackagesVersionTarball,
};

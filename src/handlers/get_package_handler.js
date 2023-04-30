/**
 * @module get_package_handler
 * @desc Endpoint Handlers for every GET Request that relates to packages themselves
 */

const logger = require("../logger.js");
const { server_url } = require("../config.js").getConfig();
const utils = require("../utils.js");
const { URL } = require("node:url");

/**
 * @async
 * @function getPackages
 * @desc Endpoint to return all packages to the user. Based on any filtering
 * theyved applied via query parameters.
 * @param {object} params - The query parameters for this endpoint.
 * @param {integer} params.page - The page to retreive
 * @param {string} params.sort - The method to sort by
 * @param {string} params.direction - The direction to sort with
 * @param {string} params.serviceType - The service type to display
 * @param {string} params.service - The service to display
 * @param {string} params.serviceVersion - The service version to show
 * @param {module} db - An instance of the database
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages
 */
async function getPackages(params, db) {

  const packages = await db.getSortedPackages(params);

  if (!packages.ok) {
    logger.generic(
      3,
      `getPackages-getSortedPackages Not OK: ${packages.content}`
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

  // The endpoint using this function needs an array.
  const packArray = Array.isArray(packObjShort) ? packObjShort : [packObjShort];

  let link = `<${server_url}/api/packages?page=${page}&sort=${params.sort}&order=${params.direction}>; rel="self", <${server_url}/api/packages?page=${totPage}&sort=${params.sort}&order=${params.direction}>; rel="last"`;

  if (page !== totPage) {
    link += `, <${server_url}/api/packages?page=${page + 1}&sort=${
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
 * @function getPackagesFeatured
 * @desc Allows the user to retrieve the featured packages, as package object shorts.
 * This endpoint was originally undocumented. The decision to return 200 is based off similar endpoints.
 * Additionally for the time being this list is created manually, the same method used
 * on Atom.io for now. Although there are plans to have this become automatic later on.
 * @see {@link https://github.com/atom/apm/blob/master/src/featured.coffee|Source Code}
 * @see {@link https://github.com/confused-Techie/atom-community-server-backend-JS/issues/23|Discussion}
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/featured
 */
async function getPackagesFeatured(db) {
  // Returns Package Object Short array.
  // TODO: Does not support engine query parameter as of now
  const packs = await db.getFeaturedPackages();

  if (!packs.ok) {
    logger.generic(
      3,
      `getPackagesFeatured-getFeaturedPackages Not OK: ${packs.content}`
    );
    return {
      ok: false,
      content: packs
    };
  }

  const packObjShort = await utils.constructPackageObjectShort(packs.content);

  // The endpoint using this function needs an array.
  const packArray = Array.isArray(packObjShort) ? packObjShort : [packObjShort];

  return {
    ok: true,
    content: packArray
  };
}

/**
 * @async
 * @function getPackagesSearch
 * @desc Allows user to search through all packages. Using their specified
 * query parameter.
 * @param {object} params - The query parameters
 * @param {integer} params.page - The page to retreive
 * @param {string} params.sort - The method to sort by
 * @param {string} params.direction - The direction to sort with
 * @param {string} params.query - The search query
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/search
 * @todo Note: This **has** been migrated to the new DB, and is fully functional.
 * The TODO here is to eventually move this to use the custom built in LCS search,
 * rather than simple search.
 */
async function getPackagesSearch(params, db) {

  // Because the task of implementing the custom search engine is taking longer
  // than expected, this will instead use super basic text searching on the DB side.
  // This is only an effort to get this working quickly and should be changed later.
  // This also means for now, the default sorting method will be downloads, not relevance.

  const packs = await db.simpleSearch(
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
      return {
        ok: true,
        content: []
      };
    }
    logger.generic(
      3,
      `getPackagesSearch-simpleSearch Not OK: ${packs.content}`
    );
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

  return {
    ok: true,
    link: link,
    total: packs.pagination.count,
    limit: packs.pagination.limit,
    content: packArray
  };
}

/**
 * @async
 * @function getPackagesDetails
 * @desc Allows the user to request a single package object full, depending
 * on the package included in the path parameter.
 * @param {object} param - The query parameters
 * @param {string} param.engine - The version of Pulsar to check compatibility with
 * @param {string} param.name - The package name
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/:packageName
 */
async function getPackagesDetails(params, db) {

  let pack = await db.getPackageByName(params.name, true);

  if (!pack.ok) {
    logger.generic(
      3,
      `getPackagesDetails-getPackageByName Not OK: ${pack.content}`
    );
    return {
      ok: false,
      content: pack
    };
  }

  pack = await utils.constructPackageObjectFull(pack.content);

  if (params.engine !== false) {
    // query.engine returns false if no valid query param is found.
    // before using engineFilter we need to check the truthiness of it.
    pack = await utils.engineFilter(pack, params.engine);
  }

  return {
    ok: true,
    content: pack
  };
}

/**
 * @async
 * @function getPackagesStargazers
 * @desc Endpoint returns the array of `star_gazers` from a specified package.
 * Taking only the package wanted, and returning it directly.
 * @param {object} params - The query parameters
 * @param {string} params.packageName - The name of the package
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/:packageName/stargazers
 */
async function getPackagesStargazers(params, db) {
  // The following can't be executed in user mode because we need the pointer
  const pack = await db.getPackageByName(params.packageName);

  if (!pack.ok) {
    return {
      ok: false,
      content: pack
    };
  }

  const stars = await db.getStarringUsersByPointer(pack.content);

  if (!stars.ok) {
    return {
      ok: false,
      content: stars
    };
  }

  const gazers = await db.getUserCollectionById(stars.content);

  if (!gazers.ok) {
    return {
      ok: false,
      content: gazers
    };
  }

  return {
    ok: true,
    content: gazers.content
  };
}

/**
 * @async
 * @function getPackagesVersion
 * @desc Used to retrieve a specific version from a package.
 * @param {object} params - The query parameters
 * @param {string} params.packageName - The Package name we care about
 * @param {string} params.versionName - The package version we care about
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/packages/:packageName/versions/:versionName
 */
async function getPackagesVersion(params, db) {
  // Check the truthiness of the returned query engine.
  if (params.versionName === false) {
    // we return a 404 for the version, since its an invalid format
    return {
      ok: false,
      content: {
        short: "Not Found",
      }
    };
  }
  // Now we know the version is a valid semver.

  const pack = await db.getPackageVersionByNameAndVersion(
    params.packageName,
    params.versionName
  );

  if (!pack.ok) {
    return {
      ok: false,
      content: pack
    };
  }

  const packRes = await utils.constructPackageObjectJSON(pack.content);

  return {
    ok: true,
    content: packRes
  };
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
async function getPackagesVersionTarball(params, db) {

  // Now that migration has began we know that each version will have
  // a tarball_url key on it, linking directly to the tarball from gh for that version.

  // we initially want to ensure we have a valid version.
  if (params.versionName === false) {
    // since query.engine gives false if invalid, we can just check if its truthy
    // additionally if its false, we know the version will never be found.
    return {
      ok: false,
      content: {
        short: "Not Found"
      }
    };
  }

  // first lets get the package
  const pack = await db.getPackageVersionByNameAndVersion(
    params.packageName,
    params.versionName
  );

  if (!pack.ok) {
    return {
      ok: false,
      content: pack
    };
  }

  const save = await db.updatePackageIncrementDownloadByName(
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
    return {
      ok: false,
      content: {
        ok: false,
        short: "Server Error",
        content: e
      }
    };
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
    return {
      ok: false,
      content: {
        ok: false,
        short: "Server Error",
        content: `Invalid Domain for Download Redirect: ${hostname}`,
      }
    };
  }

  return {
    ok: true,
    content: tarballURL
  };
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

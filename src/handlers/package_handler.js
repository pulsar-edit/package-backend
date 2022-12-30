/**
 * @module package_handler
 * @desc Endpoint Handlers in all relating to the packages themselves.
 * @implements {common_handler}
 * @implements {users}
 * @implements {data}
 * @implements {query}
 * @implements {git}
 * @implements {logger}
 * @implements {error}
 * @implements {config}
 */

const common = require("./common_handler.js");
const query = require("../query.js");
const git = require("../git.js");
const logger = require("../logger.js");
const { server_url } = require("../config.js").getConfig();
const utils = require("../utils.js");
const database = require("../database.js");
const auth = require("../auth.js");
const url = require("url");

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
  };

  const packages = await database.getSortedPackages(
    params.page,
    params.direction,
    params.sort
  );

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
 * @function postPackages
 * @desc This endpoint is used to publish a new package to the backend server.
 * Taking the repo, and your authentication for it, determines if it can be published,
 * then goes about doing so.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @return {string} JSON object of new data pushed into the database, but stripped of
 * sensitive informations like primary and foreign keys.
 * @property {http_method} - POST
 * @property {http_endpoint} - /api/packages
 */
async function postPackages(req, res) {
  const params = {
    repository: query.repo(req),
    auth: query.auth(req),
  };

  const user = await auth.verifyAuth(params.auth);
  logger.generic(
    6,
    `${user.content.username} Attempting to Publish new package`
  );
  // Check authentication.
  if (!user.ok) {
    logger.generic(3, `postPackages-verifyAuth Not OK: ${user.content}`);
    await common.handleError(req, res, user);
    return;
  }

  // Check repository format validity.
  if (params.repository === "") {
    logger.generic(6, "Repository Format Invalid, returning error");
    // The repository format is invalid.
    await common.badRepoJSON(req, res);
    return;
  }

  // Check the package does NOT exists.
  // We will utilize our database.getPackageByName to see if it returns an error,
  // which means the package doesn't exist.
  // Currently though the repository is in `owner/repo` format,
  // meanwhile getPackageByName expects just `repo`

  const repo = params.repository.split("/")[1];

  if (repo === undefined) {
    logger.generic(6, "Repository determined invalid after failed split");
    // The repository format is invalid.
    await common.badRepoJSON(req, res);
    return;
  }

  // Now check if the name is banned.
  const isBanned = await utils.isPackageNameBanned(repo);

  if (isBanned.ok) {
    logger.generic(3, `postPackages Blocked by banned package name: ${repo}`);
    // The package name is banned
    await common.handleError(req, res, {
      ok: false,
      short: "Server Error",
      content: "Package Name is banned",
    });
    // ^^^ Replace with a more specific error handler once supported TODO
    return;
  }

  const exists = await database.getPackageByName(repo, true);

  if (exists.ok) {
    logger.generic(6, "Seems Package Already exists, aborting publish");
    // The package exists.
    await common.packageExists(req, res);
    return;
  }

  // Even further though we need to check that the error is not found, since errors here can bubble.
  if (exists.short !== "Not Found") {
    logger.generic(
      3,
      `postPackages-getPackageByName Not OK: ${exists.content}`
    );
    // The server failed for some other bubbled reason, and is now encountering an error.
    await common.handleError(req, res, exists);
    return;
  }

  // Now we know the package doesn't exist. And we want to check that the user owns this repo on git.
  const gitowner = await git.ownership(user.content, params.repository);

  if (!gitowner.ok) {
    logger.generic(3, `postPackages-ownership Not OK: ${gitowner.content}`);
    await common.handleError(req, res, gitowner);
    return;
  }

  // Now knowing they own the git repo, and it doesn't exist here, lets publish.
  const newPack = await git.createPackage(params.repository, user.content);

  if (!newPack.ok) {
    logger.generic(3, `postPackages-createPackage Not OK: ${newPack.content}`);
    await common.handleError(req, res, newPack);
    return;
  }

  // Now with valid package data, we can insert them into the DB.
  const insertedNewPack = await database.insertNewPackage(newPack.content);

  if (!insertedNewPack.ok) {
    logger.generic(
      3,
      `postPackages-insertNewPackage Not OK: ${insertedNewPack.content}`
    );
    await common.handleError(req, res, insertedNewPack);
    return;
  }

  // Finally we can return what was actually put into the database.
  // Retrieve the data from database.getPackageByName() and
  // convert it into Package Object Full format.
  const newDbPack = await database.getPackageByName(repo, true);

  if (!newDbPack.ok) {
    logger.generic(
      3,
      `postPackages-getPackageByName (After Pub) Not OK: ${newDbPack.content}`
    );
    common.handleError(req, res, newDbPack);
    return;
  }

  const packageObjectFull = await utils.constructPackageObjectFull(
    newDbPack.content
  );
  res.status(201).json(packageObjectFull);
}

/**
 * @async
 * @function getPackagesFeatured
 * @desc Allows the user to retreive the featured packages, as package object shorts.
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
    sort: query.sort(req, "relevance"),
    page: query.page(req),
    direction: query.dir(req),
    query: query.query(req),
  };

  // Because the task of implementing the custom search engine is taking longer
  // than expected, this will instead use super basic text searching on the DB
  // side. This is only an effort to get this working quickly and should be changed later.
  // This also means for now, the default sorting method will be downloads, not relevance.

  const packs = await database.simpleSearch(
    params.query,
    params.page,
    params.direction,
    params.sort
  );

  if (!packs.ok) {
    if (packs.short == "Not Found") {
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
 * @function deletePackagesName
 * @desc Allows the user to delete a repo they have ownership of.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - DELETE
 * @property {http_endpoint} - /api/packages/:packageName
 */
async function deletePackagesName(req, res) {
  const params = {
    auth: query.auth(req),
    packageName: query.packageName(req),
  };

  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    await common.handleError(req, res, user, 1005);
    return;
  }

  // Lets also first check to make sure the package exists.
  const packageExists = await database.getPackageByName(
    params.packageName,
    true
  );

  if (!packageExists.ok) {
    await common.handleError(req, res, packageExists);
    return;
  }

  const gitowner = await git.ownership(
    user.content,
    utils.getOwnerRepoFromPackage(packageExists.content.data)
  );

  if (!gitowner.ok) {
    await common.handleError(req, res, gitowner, 4001);
    return;
  }

  // Now they are logged in locally, and have permission over the GitHub repo.
  const rm = await database.removePackageByName(params.packageName);

  if (!rm.ok) {
    await common.handleError(req, res, rm, 1006);
    return;
  }

  res.status(204).send();
  logger.httpLog(req, res);
}

/**
 * @async
 * @function postPackagesStar
 * @desc Used to submit a new star to a package from the authenticated user.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - POST
 * @property {http_endpoint} - /api/packages/:packageName/star
 */
async function postPackagesStar(req, res) {
  const params = {
    auth: query.auth(req),
    packageName: query.packageName(req),
  };

  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    await common.handleError(req, res, user, 1008);
    return;
  }

  const star = await database.updateIncrementStar(
    user.content,
    params.packageName
  );

  if (!star.ok) {
    await common.handleError(req, res, star, 1009);
    return;
  }

  // Now with a success we want to return the package back in this query
  let pack = await database.getPackageByName(params.packageName, true);

  if (!pack.ok) {
    await common.handleError(req, res, pack, 1011);
    return;
  }

  pack = await utils.constructPackageObjectFull(pack.content);

  res.status(200).json(pack);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function deletePackageStar
 * @desc Used to remove a star from a specific package for the authenticated usesr.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - DELETE
 * @property {http_endpoint} - /api/packages/:packageName/star
 */
async function deletePackagesStar(req, res) {
  const params = {
    auth: query.auth(req),
    packageName: query.packageName(req),
  };

  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  const unstar = await database.updateDecrementStar(
    user.content,
    params.packageName
  );

  if (!unstar.ok) {
    await common.handleError(req, res, unstar);
    return;
  }

  // On a successful action here we will return an empty 201
  res.status(201).send();
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
 * @function postPackagesVersion
 * @desc Allows a new version of a package to be published. But also can allow
 * a user to rename their application during this process.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - POST
 * @property {http_endpoint} - /api/packages/:packageName/versions
 */
async function postPackagesVersion(req, res) {
  const params = {
    tag: query.tag(req),
    rename: query.rename(req),
    auth: query.auth(req),
    packageName: query.packageName(req),
  };

  /* Check tag validity
  if (params.tag === "") {
    await common.handleError(req, res, {
      ok: false,
      short: "Bad Repo",
      content: "The tag parameter is not correctly specified",
    });
    return;
  }*/

  // On renaming:
  // When a package is being renamed, we will expect that packageName will
  // match a previously published package.
  // But then the `name` of their `package.json` will be different.
  // And if they are, we expect that `auth` is true. Because otherwise it will fail.
  // That's the methodology, the logic here just needs to catch up.

  let logString = `TMPLOG: Raw Auth Size: ${logger.sanitizeLogs(
    req.get("Authorization")?.length
  )} Parsed: ${logger.sanitizeLogs(
    params.auth !== "" ? params.auth.length : "0"
  )}`;
  logger.generic(6, logString);

  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    logger.generic(
      6,
      "User Authentication Failed when attempting to publish package version!"
    );
    await common.handleError(req, res, user);
    return;
  }
  logger.generic(
    6,
    `${user.content.username} Attempting to publish a new package version`
  );

  // To support a rename, we need to check if they have permissions over this packages new name.
  // Which means we have to check if they have ownership AFTER we collect it's data.

  const packExists = await database.getPackageByName(params.packageName, true);

  if (!packExists.ok) {
    logger.generic(
      6,
      "Seems Package exists when trying to publish new version"
    );
    await common.handleError(req, res, packExists);
    return;
  }

  // Get `owner/repo` string format from package.
  const ownerRepo = utils.getOwnerRepoFromPackage(packExists.content.data);

  // Now it's important to note, that getPackageJSON was intended to be an internal function.
  // As such does not return a Server Status Object. This may change later, but for now,
  // we will expect `undefined` to not be success.
  const packJSON = await git.getPackageJSON(ownerRepo, user.content);

  if (packJSON === undefined) {
    logger.generic(6, `Unable to get Package JSON from git with: ${ownerRepo}`);
    await common.handleError(req, res, {
      ok: false,
      short: "Bad Package",
      content: `Failed to get Package JSON: ${ownerRepo}`,
    });
    return;
  }

  // Now we will also need to get the packages data to update on the db
  // during version pushes.

  const packReadme = await git.getRepoReadMe(ownerRepo, user.content);
  // Again important to note, this was intended as an internal function of git
  // As such does not return a Server Status Object, and instead returns the obj or null
  if (packReadme === undefined) {
    logger.generic(6, `Unable to Get Package Readme from git with: ${ownerRepo}`);
    await common.handleError(req, res, {
      ok: false,
      short: "Bad Package",
      content: `Failed to get Package Readme: ${ownerRepo}`
    });
  }

  // Now construct the object that will be used to update the `data` column.
  const packageData = {
    name: packJSON.name.toLowerCase(),
    repository: git.selectPackageRepository(packJSON.repository),
    readme: packReadme,
    metadata: packJSON
  };

  const newName = packJSON.name;
  const currentName = packExists.content.name;
  if (newName !== currentName && !params.rename) {
    logger.generic(
      6,
      "Package JSON and Params Package Names don't match, with no rename flag"
    );
    // Only return error if the names don't match, and rename isn't enabled.
    await common.handleError(req, res, {
      ok: false,
      short: "Bad Repo",
      content: "Package name doesn't match local name, with rename false",
    });
    return;
  }

  // Else we will continue, and trust the name provided from the package as being accurate.
  // And now we can ensure the user actually owns this repo, with our updated name.

  const gitowner = await git.ownership(user.content, ownerRepo);

  if (!gitowner.ok) {
    logger.generic(6, `User Failed Git Ownership Check: ${gitowner.content}`);
    await common.handleError(req, res, gitowner);
    return;
  }

  // Now the only thing left to do, is add this new version with the name from the package.
  // And check again if the name is incorrect, since it'll need a new entry onto the names.

  const rename = newName !== currentName && params.rename;
  if (rename) {
    // Before allowing the rename of a package, ensure the new name isn't banned.

    const isBanned = await utils.isPackageNameBanned(newName);

    if (isBanned.ok) {
      logger.generic(3, `postPackages Blocked by banned package name: ${repo}`);
      // is banned
      await common.handleError(req, res, {
        ok: false,
        short: "Server Error",
        content: "Package Name is Banned",
      });
      // TODO ^^^ Replace with specific error once more are supported.
      return;
    }
  }

  // Now add the new Version key.

  const addVer = await database.insertNewPackageVersion(
    packJSON,
    packageData,
    rename ? currentName : null
  );

  if (!addVer.ok) {
    logger.generic(6, "Failed to add the new package version to the db");
    await common.handleError(req, res, addVer);
    return;
  }

  res.status(201).json(addVer.content);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getPackagesVersion
 * @desc Used to retreive a specific version from a package.
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
  //let tarballURL = new url((pack.content.meta.tarball_url ? pack.content.meta.tarball_url : ""));
  let tarballURL = pack.content.meta.tarball_url;

  if (tarballURL !== undefined && false) {
    // todo the url feature doesn't work the way we would expect in production
    tarballURL = url.parse(pack.content.meta.tarball_url);

    if (
      url.hostname != "codeload.github.com" ||
      url.hostname != "api.github.com" ||
      url.hostname != "github.com" ||
      url.hostname != "raw.githubusercontent.com"
    ) {
      await common.handleError(req, res, {
        ok: false,
        short: "Server Error",
        content: `Invalid Domain for Download Redirect: ${url.toString()}`,
      });
      return;
    }

    tarballURL = tarballURL.toString();
  } else {
    // we are likely in a test environment. And will just leave this blank to error out on the client side.
    //tarballURL = "";
  }

  res.redirect(tarballURL);
  logger.httpLog(req, res);
  return;
}

/**
 * @async
 * @function deletePackageVersion
 * @desc Allows a user to delete a specific version of their package.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - DELETE
 * @property {http_endpoint} - /api/packages/:packageName/versions/:versionName
 */
async function deletePackageVersion(req, res) {
  const params = {
    auth: query.auth(req),
    packageName: query.packageName(req),
    versionName: query.engine(req.params.versionName),
  };

  // Moving this forward to do the least computationally expensive task first.
  // Check version validity
  if (params.versionName === false) {
    await common.notFound(req, res);
    return;
  }

  // Verify the user has local and remote permissions
  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  // Lets also first check to make sure the package exists.
  const packageExists = await database.getPackageByName(
    params.packageName,
    true
  );

  if (!packageExists.ok) {
    await common.handleError(req, res, packageExists);
    return;
  }

  const gitowner = await git.ownership(
    user.content,
    utils.getOwnerRepoFromPackage(packageExists.content.data)
  );

  if (!gitowner.ok) {
    await common.handleError(req, res, gitowner);
    return;
  }

  // Mark the specified version for deletion, if version is valid
  const removeVersion = await database.removePackageVersion(
    params.packageName,
    params.versionName
  );

  if (!removeVersion.ok) {
    await common.handleError(req, res, removeVersion);
    return;
  }

  res.status(204).send();
  logger.httpLog(req, res);
}

/**
 * @async
 * @function postPackagesEventUninstall
 * @desc Used when a package is uninstalled, decreases the download count by 1.
 * And saves this data, Originally an undocumented endpoint.
 * The decision to return a '201' was based on how other POST endpoints return,
 * during a successful event.
 * @see {@link https://github.com/atom/apm/blob/master/src/uninstall.coffee}
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - POST
 * @property {http_endpoint} - /api/packages/:packageName/versions/:versionName/events/uninstall
 */
async function postPackagesEventUninstall(req, res) {
  const params = {
    auth: query.auth(req),
    packageName: query.packageName(req),
    // TODO: versionName unused parameter. On the roadmap to be removed.
    // See https://github.com/confused-Techie/atom-backend/pull/88#issuecomment-1331809594
    versionName: query.engine(req.params.versionName),
  };

  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    await common.handleError(req, res, user);
    return;
  }

  // TODO: How does this impact performance? Wonder if we could return
  // the next command with more intelligence to know the pack doesn't exist.
  const packExists = await database.getPackageByName(params.packageName, true);

  if (!packExists.ok) {
    await common.handleError(req, res, packExists);
    return;
  }

  const write = await database.updatePackageDecrementDownloadByName(
    params.packageName
  );

  if (!write.ok) {
    await common.handleError(req, res, write);
    return;
  }

  res.status(200).json({ ok: true });
  logger.httpLog(req, res);
}

module.exports = {
  getPackages,
  postPackages,
  getPackagesFeatured,
  getPackagesSearch,
  getPackagesDetails,
  deletePackagesName,
  postPackagesStar,
  deletePackagesStar,
  getPackagesStargazers,
  postPackagesVersion,
  getPackagesVersion,
  getPackagesVersionTarball,
  deletePackageVersion,
  postPackagesEventUninstall,
};

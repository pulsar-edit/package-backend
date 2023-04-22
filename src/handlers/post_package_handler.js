/**
 * @module post_package_handler
 * @desc Endpoint Handlers for every POST Request that relates to packages themselves
 */

const common = require("./common_handler.js");
const query = require("../query.js");
const vcs = require("../vcs.js");
const logger = require("../logger.js");
const utils = require("../utils.js");
const database = require("../database.js");
const auth = require("../auth.js");
const webhook = require("../webhook.js");

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

  // Currently though the repository is in `owner/repo` format,
  // meanwhile needed functions expects just `repo`

  const repo = params.repository.split("/")[1]?.toLowerCase();

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

  // Check the package does NOT exists.
  // We will utilize our database.packageNameAvailability to see if the name is available.

  const nameAvailable = await database.packageNameAvailability(repo);

  if (!nameAvailable.ok) {
    // Even further though we need to check that the error is not "Not Found",
    // since an exception could have been caught.
    if (nameAvailable.short !== "Not Found") {
      logger.generic(
        3,
        `postPackages-getPackageByName Not OK: ${nameAvailable.content}`
      );
      // The server failed for some other bubbled reason, and is now encountering an error
      await common.handleError(req, res, nameAvailable);
      return;
    }
    // But if the short is then only "Not Found" we can report it as not being available
    logger.generic(
      6,
      "The name for the package is not available: aborting publish"
    );
    // The package exists.
    await common.packageExists(req, res);
    return;
  }

  // Now we know the package doesn't exist. And we want to check that the user owns this repo on git.
  const gitowner = await vcs.ownership(user.content, params.repository);

  if (!gitowner.ok) {
    logger.generic(3, `postPackages-ownership Not OK: ${gitowner.content}`);
    await common.handleError(req, res, gitowner);
    return;
  }

  // Now knowing they own the git repo, and it doesn't exist here, lets publish.
  // TODO: Stop hardcoding `git` as service
  const newPack = await vcs.newPackageData(
    user.content,
    params.repository,
    "git"
  );

  if (!newPack.ok) {
    logger.generic(3, `postPackages-createPackage Not OK: ${newPack.content}`);
    await common.handleDetailedError(req, res, newPack);
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

  // === Preform after publish actions, done after return to avoid user wait time

  // Webhook for Publication
  await webhook.alertPublishPackage(packageObjectFull, user.content);

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
    rename: query.rename(req),
    auth: query.auth(req),
    packageName: query.packageName(req),
  };

  // On renaming:
  // When a package is being renamed, we will expect that packageName will
  // match a previously published package.
  // But then the `name` of their `package.json` will be different.
  // And if they are, we expect that `auth` is true. Because otherwise it will fail.
  // That's the methodology, the logic here just needs to catch up.

  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    logger.generic(
      6,
      "User Authentication Failed when attempting to publish package version!"
    );

    await common.handleDetailedError(req, res, user);
    return;
  }
  logger.generic(
    6,
    `${user.content.username} Attempting to publish a new package version - ${params.packageName}`
  );

  // To support a rename, we need to check if they have permissions over this packages new name.
  // Which means we have to check if they have ownership AFTER we collect it's data.

  const packExists = await database.getPackageByName(params.packageName, true);

  if (!packExists.ok) {
    logger.generic(
      6,
      `Seems Package does not exist when trying to publish new version - ${packExists.content}`
    );
    await common.handleDetailedError(req, res, {
      ok: false,
      short: packExists.short,
      content:
        "The server was unable to locate your package when publishing a new version.",
    });
    return;
  }

  // Get `owner/repo` string format from package.
  let ownerRepo = utils.getOwnerRepoFromPackage(packExists.content.data);

  // Using our new VCS Service
  // TODO: The "git" Service shouldn't always be hardcoded.
  let packMetadata = await vcs.newVersionData(user.content, ownerRepo, "git");

  if (!packMetadata.ok) {
    logger.generic(6, packMetadata.content);
    await common.handleError(req, res, packMetadata);
    return;
  }
  // Now it's important to note, that getPackageJSON was intended to be an internal function.
  // As such does not return a Server Status Object. This may change later, but for now,
  // we will expect `undefined` to not be success.
  //const packJSON = await git.getPackageJSON(ownerRepo, user.content);

  //if (packJSON === undefined) {
  //  logger.generic(6, `Unable to get Package JSON from git with: ${ownerRepo}`);
  //  await common.handleError(req, res, {
  //    ok: false,
  //    short: "Bad Package",
  //    content: `Failed to get Package JSON: ${ownerRepo}`,
  //  });
  //  return;
  //}

  // Now we will also need to get the packages data to update on the db
  // during version pushes.

  //const packReadme = await git.getRepoReadMe(ownerRepo, user.content);
  // Again important to note, this was intended as an internal function of git
  // As such does not return a Server Status Object, and instead returns the obj or null
  //if (packReadme === undefined) {
  //  logger.generic(
  //    6,
  //    `Unable to Get Package Readme from git with: ${ownerRepo}`
  //  );
  //  await common.handleError(req, res, {
  //    ok: false,
  //    short: "Bad Package",
  //    content: `Failed to get Package Readme: ${ownerRepo}`,
  //  });
  //}

  //const packMetadata = await git.metadataAppendTarballInfo(
  //  packJSON,
  //  packJSON.version,
  //  user.content
  //);
  //if (packMetadata === undefined) {
  //  await common.handleError(req, res, {
  //    ok: false,
  //    short: "Bad Package",
  //    content: `Failed to get Package metadata info: ${ownerRepo}`,
  //  });
  //}

  // Now construct the object that will be used to update the `data` column.
  //const packageData = {
  //  name: packMetadata.name.toLowerCase(),
  //  repository: git.selectPackageRepository(packMetadata.repository),
  //  readme: packReadme,
  //  metadata: packMetadata,
  //};

  const newName = packMetadata.content.name;

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

  // But to support a GH repo being renamed, we will now regrab the owner/repo combo
  // From the newest updated `package.json` info, just in case it's changed that will be
  // supported here

  ownerRepo = utils.getOwnerRepoFromPackage(packMetadata.content.metadata);

  //const gitowner = await git.ownership(user.content, ownerRepo);
  const gitowner = await vcs.ownership(user.content, packMetadata.content);

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
      logger.generic(
        3,
        `postPackages Blocked by banned package name: ${newName}`
      );
      await common.handleDetailedError(req, res, {
        ok: false,
        short: "Server Error",
        content: "This Package Name is Banned on the Pulsar Registry.",
      });
      return;
    }

    const isAvailable = await database.packageNameAvailability(newName);

    if (isAvailable.ok) {
      logger.generic(
        3,
        `postPackages Blocked by new name ${newName} not available`
      );
      await common.handleDetailedError(req, res, {
        ok: false,
        short: "Server Error",
        content: `The Package Name: ${newName} is not available.`,
      });
      return;
    }
  }

  // Now add the new Version key.

  const addVer = await database.insertNewPackageVersion(
    packMetadata.content,
    rename ? currentName : null
  );

  if (!addVer.ok) {
    // TODO: Use hardcoded message until we can verify messages from the db are safe
    // to pass directly to end users.
    await common.handleDetailedError(req, res, {
      ok: addVer.ok,
      short: addVer.short,
      content: "Failed to add the new package version to the database.",
    });
    return;
  }

  // TODO: Additionally update things like the readme on the package here

  res.status(201).json(addVer.content);
  logger.httpLog(req, res);

  // === Preform after version publish actions, done after return to avoid user wait time

  // Webhook for Version Publication
  await webhook.alertPublishVersion(packMetadata.content, user.content);

  // Badge Check
  if (Array.isArray(packMetadata.content.badges)) {
    // Then we want to find and remove any badges that are invalidated on new versions
    let replacementBadges = [];
    for (const b of packMetadata.content.badges) {
      if (b.title !== "Outdated") {
        replacementBadges.push(b);
      }
    }
    // Now that we have collected all badges that shouldn't be pruned, lets equality check

    // (will likely need to make a utils array equals function)
    // If not equal, write the new array to the DB, if it is, then return without action
  }
}

/**
 * @async
 * @function postPackagesEventUninstall
 * @desc Used when a package is uninstalled, decreases the download count by 1.
 * And saves this data, Originally an undocumented endpoint.
 * The decision to return a '201' was based on how other POST endpoints return,
 * during a successful event. This endpoint has now been deprecated, as it serves
 * no useful features, and on further examination may have been intended as a way
 * to collect data on users, which is not something we implement.
 * @deprecated since v 1.0.2
 * @see {@link https://github.com/atom/apm/blob/master/src/uninstall.coffee}
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - POST
 * @property {http_endpoint} - /api/packages/:packageName/versions/:versionName/events/uninstall
 */
async function postPackagesEventUninstall(req, res) {
  res.status(200).json({ ok: true });
  logger.httpLog(req, res);
}

module.exports = {
  postPackages,
  postPackagesStar,
  postPackagesVersion,
  postPackagesEventUninstall,
};

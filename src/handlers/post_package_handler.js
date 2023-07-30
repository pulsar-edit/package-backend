/**
 * @module post_package_handler
 * @desc Endpoint Handlers for every POST Request that relates to packages themselves
 */

const logger = require("../logger.js");
const utils = require("../utils.js");

/**
 * @async
 * @function postPackages
 * @desc This endpoint is used to publish a new package to the backend server.
 * Taking the repo, and your authentication for it, determines if it can be published,
 * then goes about doing so.
 * @param {object} params - The query parameters
 * @param {string} params.repository - The `owner/repo` combo of the remote package
 * @param {string} params.auth - The API key of the user
 * @param {module} db - An instance of the `database.js` module
 * @param {module} auth - An instance of the `auth.js` module
 * @param {module} vcs - An instance of the `vcs.js` module
 * @return {string} JSON object of new data pushed into the database, but stripped of
 * sensitive informations like primary and foreign keys.
 * @property {http_method} - POST
 * @property {http_endpoint} - /api/packages
 */
async function postPackages(params, db, auth, vcs) {
  const user = await auth.verifyAuth(params.auth, db);
  logger.generic(
    6,
    `${user.content.username} Attempting to Publish new package`
  );
  // Check authentication.
  if (!user.ok) {
    logger.generic(3, `postPackages-verifyAuth Not OK: ${user.content}`);
    return {
      ok: false,
      content: user,
    };
  }

  // Check repository format validity.
  if (params.repository === "") {
    logger.generic(6, "Repository Format Invalid, returning error");
    // The repository format is invalid.
    return {
      ok: false,
      content: {
        short: "Bad Repo",
      },
    };
  }

  // Currently though the repository is in `owner/repo` format,
  // meanwhile needed functions expects just `repo`

  const repo = params.repository.split("/")[1]?.toLowerCase();

  if (repo === undefined) {
    logger.generic(6, "Repository determined invalid after failed split");
    // The repository format is invalid.
    return {
      ok: false,
      content: {
        short: "Bad Repo",
      },
    };
  }

  // Now check if the name is banned.
  const isBanned = await utils.isPackageNameBanned(repo);

  if (isBanned.ok) {
    logger.generic(3, `postPackages Blocked by banned package name: ${repo}`);
    // The package name is banned
    return {
      ok: false,
      type: "detailed",
      content: {
        ok: false,
        short: "Server Error",
        content: "Package Name is banned.",
      },
    };
    // ^^^ Replace with a more specific error handler once supported TODO
  }

  // Check the package does NOT exists.
  // We will utilize our database.packageNameAvailability to see if the name is available.

  const nameAvailable = await db.packageNameAvailability(repo);

  if (!nameAvailable.ok) {
    // Even further though we need to check that the error is not "Not Found",
    // since an exception could have been caught.
    if (nameAvailable.short !== "Not Found") {
      logger.generic(
        3,
        `postPackages-getPackageByName Not OK: ${nameAvailable.content}`
      );
      // The server failed for some other bubbled reason, and is now encountering an error
      return {
        ok: false,
        content: nameAvailable,
      };
    }
    // But if the short is then only "Not Found" we can report it as not being available
    logger.generic(
      6,
      "The name for the package is not available: aborting publish"
    );
    // The package exists.
    return {
      ok: false,
      content: {
        short: "Package Exists",
      },
    };
  }

  // Now we know the package doesn't exist. And we want to check that the user owns this repo on git.
  const gitowner = await vcs.ownership(user.content, params.repository);

  if (!gitowner.ok) {
    logger.generic(3, `postPackages-ownership Not OK: ${gitowner.content}`);
    return {
      ok: false,
      content: gitowner,
    };
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
    return {
      ok: false,
      type: "detailed",
      content: newPack,
    };
  }

  // Now with valid package data, we can insert them into the DB.
  const insertedNewPack = await db.insertNewPackage(newPack.content);

  if (!insertedNewPack.ok) {
    logger.generic(
      3,
      `postPackages-insertNewPackage Not OK: ${insertedNewPack.content}`
    );
    return {
      ok: false,
      content: insertedNewPack,
    };
  }

  // Finally we can return what was actually put into the database.
  // Retrieve the data from database.getPackageByName() and
  // convert it into Package Object Full format.
  const newDbPack = await db.getPackageByName(repo, true);

  if (!newDbPack.ok) {
    logger.generic(
      3,
      `postPackages-getPackageByName (After Pub) Not OK: ${newDbPack.content}`
    );
    return {
      ok: false,
      content: newDbPack,
    };
  }

  const packageObjectFull = await utils.constructPackageObjectFull(
    newDbPack.content
  );

  // Since this is a webhook call, we will return with some extra data
  return {
    ok: true,
    content: packageObjectFull,
    webhook: {
      pack: packageObjectFull,
      user: user.content,
    },
    featureDetection: {
      user: user.content,
      service: "git", // TODO Stop hardcoding Git
      ownerRepo: params.repository,
    },
  };
}

/**
 * @async
 * @function postPackagesStar
 * @desc Used to submit a new star to a package from the authenticated user.
 * @param {object} params - The query parameters
 * @param {string} params.auth - The API key of the user
 * @param {string} params.packageName - The name of the package
 * @param {module} db - An instance of the `database.js` module
 * @param {module} auth - An instance of the `auth.js` module
 * @property {http_method} - POST
 * @property {http_endpoint} - /api/packages/:packageName/star
 */
async function postPackagesStar(params, db, auth) {
  const user = await auth.verifyAuth(params.auth, db);

  if (!user.ok) {
    return {
      ok: false,
      content: user,
    };
  }

  const star = await db.updateIncrementStar(user.content, params.packageName);

  if (!star.ok) {
    return {
      ok: false,
      content: star,
    };
  }

  // Now with a success we want to return the package back in this query
  let pack = await db.getPackageByName(params.packageName, true);

  if (!pack.ok) {
    return {
      ok: false,
      content: pack,
    };
  }

  pack = await utils.constructPackageObjectFull(pack.content);

  return {
    ok: true,
    content: pack,
  };
}

/**
 * @async
 * @function postPackagesVersion
 * @desc Allows a new version of a package to be published. But also can allow
 * a user to rename their application during this process.
 * @param {object} params - The query parameters
 * @param {boolean} params.rename - Whether or not to preform a rename
 * @param {string} params.auth - The API key of the user
 * @param {string} params.packageName - The name of the package
 * @param {module} db - An instance of the `database.js` module
 * @param {module} auth - An instance of the `auth.js` module
 * @param {module} vcs - An instance of the `vcs.js` module
 * @property {http_method} - POST
 * @property {http_endpoint} - /api/packages/:packageName/versions
 */
async function postPackagesVersion(params, db, auth, vcs) {
  // On renaming:
  // When a package is being renamed, we will expect that packageName will
  // match a previously published package.
  // But then the `name` of their `package.json` will be different.
  // And if they are, we expect that `rename` is true. Because otherwise it will fail.
  // That's the methodology, the logic here just needs to catch up.

  const user = await auth.verifyAuth(params.auth, db);

  if (!user.ok) {
    logger.generic(
      6,
      "User Authentication Failed when attempting to publish package version!"
    );

    return {
      ok: false,
      type: "detailed",
      content: user,
    };
  }
  logger.generic(
    6,
    `${user.content.username} Attempting to publish a new package version - ${params.packageName}`
  );

  // To support a rename, we need to check if they have permissions over this packages new name.
  // Which means we have to check if they have ownership AFTER we collect it's data.

  const packExists = await db.getPackageByName(params.packageName, true);

  if (!packExists.ok) {
    logger.generic(
      6,
      `Seems Package does not exist when trying to publish new version - ${packExists.content}`
    );
    return {
      ok: false,
      type: "detailed",
      content: {
        ok: false,
        short: packExists.short,
        content:
          "The server was unable to locate your package when publishing a new version.",
      },
    };
  }

  // Get `owner/repo` string format from package.
  let ownerRepo = utils.getOwnerRepoFromPackage(packExists.content.data);

  // Using our new VCS Service
  // TODO: The "git" Service shouldn't always be hardcoded.
  let packMetadata = await vcs.newVersionData(user.content, ownerRepo, "git");

  if (!packMetadata.ok) {
    logger.generic(6, packMetadata.content);
    return {
      ok: false,
      content: packMetadata,
    };
  }

  const newName = packMetadata.content.name;

  const currentName = packExists.content.name;
  if (newName !== currentName && !params.rename) {
    logger.generic(
      6,
      "Package JSON and Params Package Names don't match, with no rename flag"
    );
    // Only return error if the names don't match, and rename isn't enabled.
    return {
      ok: false,
      content: {
        ok: false,
        short: "Bad Repo",
        content: "Package name doesn't match local name, with rename false",
      },
    };
  }

  // Else we will continue, and trust the name provided from the package as being accurate.
  // And now we can ensure the user actually owns this repo, with our updated name.

  // By passing `packMetadata` explicitely, it ensures that data we use to check
  // ownership is fresh, allowing for things like a package rename.

  const gitowner = await vcs.ownership(user.content, packMetadata.content);

  if (!gitowner.ok) {
    logger.generic(6, `User Failed Git Ownership Check: ${gitowner.content}`);
    return {
      ok: false,
      content: gitowner,
    };
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
      return {
        ok: false,
        type: "detailed",
        content: {
          ok: false,
          short: "Server Error",
          content: "This Package Name is Banned on the Pulsar Registry.",
        },
      };
    }

    const isAvailable = await db.packageNameAvailability(newName);

    if (isAvailable.ok) {
      logger.generic(
        3,
        `postPackages Blocked by new name ${newName} not available`
      );
      return {
        ok: false,
        type: "detailed",
        content: {
          ok: false,
          short: "Server Error",
          content: `The Package Name: ${newName} is not available.`,
        },
      };
    }
  }

  // Now add the new Version key.

  const addVer = await db.insertNewPackageVersion(
    packMetadata.content,
    rename ? currentName : null
  );

  if (!addVer.ok) {
    // TODO: Use hardcoded message until we can verify messages from the db are safe
    // to pass directly to end users.
    return {
      ok: false,
      type: "detailed",
      content: {
        ok: addVer.ok,
        short: addVer.short,
        content: "Failed to add the new package version to the database.",
      },
    };
  }

  return {
    ok: true,
    content: addVer.content,
    webhook: {
      pack: packMetadata.content,
      user: user.content,
    },
    featureDetection: {
      user: user.content,
      service: "git", // TODO Stop hardcoding git
      ownerRepo: ownerRepo,
    },
  };
}

module.exports = {
  postPackages,
  postPackagesStar,
  postPackagesVersion,
};

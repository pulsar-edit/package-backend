/**
 * @module delete_package_handler
 * @desc Endpoint Handlers for every DELETE Request that relates to packages themselves
 */

const logger = require("../logger.js");

/**
 * @async
 * @function deletePackagesName
 * @desc Allows the user to delete a repo they have ownership of.
 * @param {object} params - The query parameters
 * @param {string} params.auth - The API key for the user
 * @param {string} params.packageName - The name of the package
 * @param {module} db - An instance of the `database.js` module
 * @param {module} auth - An instance of the `auth.js` module
 * @param {module} vcs - An instance of the `vcs.js` module
 * @property {http_method} - DELETE
 * @property {http_endpoint} - /api/packages/:packageName
 */
async function deletePackagesName(params, db, auth, vcs) {
  const user = await auth.verifyAuth(params.auth, db);

  if (!user.ok) {
    return {
      ok: false,
      content: user,
    };
  }

  // Lets also first check to make sure the package exists.
  const packageExists = await db.getPackageByName(params.packageName, true);

  if (!packageExists.ok) {
    return {
      ok: false,
      content: packageExists,
    };
  }

  logger.generic(
    6,
    `${params.packageName} Successfully executed 'db.getPackageByName()'`
  );

  const gitowner = await vcs.ownership(user.content, packageExists.content);

  if (!gitowner.ok) {
    return {
      ok: false,
      content: gitowner,
    };
  }

  logger.generic(
    6,
    `${params.packageName} Successfully executed 'vcs.ownership()'`
  );

  // Now they are logged in locally, and have permission over the GitHub repo.
  const rm = await db.removePackageByName(params.packageName);

  if (!rm.ok) {
    logger.generic(
      6,
      `${params.packageName} FAILED to execute 'db.removePackageByName'`,
      {
        type: "error",
        err: rm
      }
    );
    return {
      ok: false,
      content: rm,
    };
  }

  logger.generic(
    6,
    `${params.packageName} Successfully executed 'db.removePackageByName'`
  );

  return {
    ok: true,
  };
}

/**
 * @async
 * @function deletePackageStar
 * @desc Used to remove a star from a specific package for the authenticated usesr.
 * @param {object} params - The query parameters
 * @param {string} params.auth - The API Key of the user
 * @param {string} params.packageName - The name of the package
 * @param {module} db - An instance of the `database.js` module
 * @param {module} auth - An instance of the `auth.js` module
 * @property {http_method} - DELETE
 * @property {http_endpoint} - /api/packages/:packageName/star
 */
async function deletePackagesStar(params, db, auth) {
  const user = await auth.verifyAuth(params.auth, db);

  if (!user.ok) {
    return {
      ok: false,
      content: user,
    };
  }

  const unstar = await db.updateDecrementStar(user.content, params.packageName);

  if (!unstar.ok) {
    return {
      ok: false,
      content: unstar,
    };
  }

  // On a successful action here we will return an empty 201
  return {
    ok: true,
  };
}

/**
 * @async
 * @function deletePackageVersion
 * @desc Allows a user to delete a specific version of their package.
 * @param {object} params - The query parameters
 * @param {string} params.auth - The API key of the user
 * @param {string} params.packageName - The name of the package
 * @param {string} params.versionName - The version of the package
 * @param {module} db - An instance of the `database.js` module
 * @param {module} auth - An instance of the `auth.js` module
 * @param {module} vcs - An instance of the `vcs.js` module
 * @property {http_method} - DELETE
 * @property {http_endpoint} - /api/packages/:packageName/versions/:versionName
 */
async function deletePackageVersion(params, db, auth, vcs) {
  // Moving this forward to do the least computationally expensive task first.
  // Check version validity
  if (params.versionName === false) {
    return {
      ok: false,
      content: {
        short: "Not Found",
      },
    };
  }

  // Verify the user has local and remote permissions
  const user = await auth.verifyAuth(params.auth, db);

  if (!user.ok) {
    return {
      ok: false,
      content: user,
    };
  }

  // Lets also first check to make sure the package exists.
  const packageExists = await db.getPackageByName(params.packageName, true);

  if (!packageExists.ok) {
    return {
      ok: false,
      content: packageExists,
    };
  }

  const gitowner = await vcs.ownership(user.content, packageExists.content);

  if (!gitowner.ok) {
    return {
      ok: false,
      content: gitowner,
    };
  }

  // Mark the specified version for deletion, if version is valid
  const removeVersion = await db.removePackageVersion(
    params.packageName,
    params.versionName
  );

  if (!removeVersion.ok) {
    return {
      ok: false,
      content: removeVersion,
    };
  }

  return { ok: true };
}

module.exports = {
  deletePackagesName,
  deletePackagesStar,
  deletePackageVersion,
};

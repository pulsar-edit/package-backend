/**
 * @module delete_package_handler
 * @desc Endpoint Handlers for every DELETE Request that relates to packages themselves
 */

const common = require("./common_handler.js");
const query = require("../query.js");
const vcs = require("../vcs.js");
const logger = require("../logger.js");
const database = require("../database.js");
const auth = require("../auth.js");

/**
 * @async
 * @function deletePackagesName
 * @desc Allows the user to delete a repo they have ownership of.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - DELETE
 * @property {http_endpoint} - /api/packages/:packageName
 */
async function deletePackagesName(params) {

  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    return {
      ok: false,
      content: user
    };
  }

  // Lets also first check to make sure the package exists.
  const packageExists = await database.getPackageByName(
    params.packageName,
    true
  );

  if (!packageExists.ok) {
    return {
      ok: false,
      content: packageExists
    };
  }

  const gitowner = await vcs.ownership(user.content, packageExists.content);

  if (!gitowner.ok) {
    return {
      ok: false,
      content: gitowner
    };
  }

  // Now they are logged in locally, and have permission over the GitHub repo.
  const rm = await database.removePackageByName(params.packageName);

  if (!rm.ok) {
    return {
      ok: false,
      content: rm
    };
  }

  return {
    ok: true
  };
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
async function deletePackagesStar(params) {

  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    return {
      ok: false,
      content: user
    };
  }

  const unstar = await database.updateDecrementStar(
    user.content,
    params.packageName
  );

  if (!unstar.ok) {
    return {
      ok: false,
      content: unstar
    };
  }

  // On a successful action here we will return an empty 201
  return {
    ok: true
  };
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
async function deletePackageVersion(params) {

  // Moving this forward to do the least computationally expensive task first.
  // Check version validity
  if (params.versionName === false) {
    return {
      ok: false,
      content: {
        short: "Not Found"
      }
    };
  }

  // Verify the user has local and remote permissions
  const user = await auth.verifyAuth(params.auth);

  if (!user.ok) {
    return {
      ok: false,
      content: user
    };
  }

  // Lets also first check to make sure the package exists.
  const packageExists = await database.getPackageByName(
    params.packageName,
    true
  );

  if (!packageExists.ok) {
    return {
      ok: false,
      content: packageExists
    };
  }

  const gitowner = await vcs.ownership(user.content, packageExists.content);

  if (!gitowner.ok) {
    return {
      ok: false,
      content: gitowner
    };
  }

  // Mark the specified version for deletion, if version is valid
  const removeVersion = await database.removePackageVersion(
    params.packageName,
    params.versionName
  );

  if (!removeVersion.ok) {
    return {
      ok: false,
      content: removeVersion
    };
  }

  return { ok: true };
}

module.exports = {
  deletePackagesName,
  deletePackagesStar,
  deletePackageVersion,
};

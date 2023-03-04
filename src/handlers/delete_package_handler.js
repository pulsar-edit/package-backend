/**
 * @module delete_package_handler
 * @desc Endpoint Handlers for every DELETE Request that relates to packages themselves
 */

const common = require("./common_handler.js");
const query = require("../query.js");
const vcs = require("../vcs.js");
const logger = require("../logger.js");
const utils = require("../utils.js");
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

  const gitowner = await vcs.ownership(user.content, packageExists.content);

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

  //const packMetadata = packageExists.content?.versions[0]?.meta;

  //if (packMetadata === null) {
  //  await common.handleError(req, res, {
  //    ok: false,
  //    short: "Not Found",
  //    content: `Cannot retrieve metadata for ${params.packageName} package`,
  //  });
  //}

  //const gitowner = await git.ownership(
  //  user.content,
  //  utils.getOwnerRepoFromPackage(packMetadata)
  //);
  const gitowner = await vcs.ownership(user.content, packageExists.content);

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

module.exports = {
  deletePackagesName,
  deletePackagesStar,
  deletePackageVersion,
};

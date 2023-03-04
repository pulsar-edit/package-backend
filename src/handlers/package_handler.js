/**
 * @module package_handler
 * @desc Exports individual files handling endpoints relating to Packages
 */

const getPackageHandler = require("./get_package_handler.js");
const postPackageHandler = require("./post_package_handler.js");
const deletePackageHandler = require("./delete_package_handler.js");

module.exports = {
  getPackages: getPackageHandler.getPackages,
  postPackages: postPackageHandler.postPackages,
  getPackagesFeatured: getPackageHandler.getPackagesFeatured,
  getPackagesSearch: getPackageHandler.getPackagesSearch,
  getPackagesDetails: getPackageHandler.getPackagesDetails,
  deletePackagesName: deletePackageHandler.deletePackagesName,
  postPackagesStar: postPackageHandler.postPackagesStar,
  deletePackagesStar: deletePackageHandler.deletePackagesStar,
  getPackagesStargazers: getPackageHandler.getPackagesStargazers,
  postPackagesVersion: postPackageHandler.postPackagesVersion,
  getPackagesVersion: getPackageHandler.getPackagesVersion,
  getPackagesVersionTarball: getPackageHandler.getPackagesVersionTarball,
  deletePackageVersion: deletePackageHandler.deletePackageVersion,
  postPackagesEventUninstall: postPackageHandler.postPackagesEventUninstall,
};

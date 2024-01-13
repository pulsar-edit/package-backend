// Exports all the endpoints that need to be required

// We register endpoints in a specific order because the loosy paths are always
// matched first. So we ensured to insert paths from strictest to loosest
// based on each parent slug or http method utilized.
// In simple terms, when a path has a parameter, add them longest path to shortest
module.exports = [
  require("./getLogin.js"),
  require("./getOauth.js"),
  require("./getPackages"),
  require("./getPackagesFeatured.js"),
  require("./getPackagesSearch.js"),
  require("./getPat.js"),
  require("./getRoot.js"),
  require("./getStars.js"),
  require("./getThemes.js"),
  require("./getThemesFeatured.js"),
  require("./getThemesSearch.js"),
  require("./getUpdates.js"),
  require("./getUsers.js"),
  require("./postPackages.js"),
  // Items with path parameters
  require("./deletePackagesPackageNameVersionsVersionName.js"),
  require("./deletePackagesPackageNameStar.js"),
  require("./deletePackagesPackageName.js"),
  require("./getPackagesPackageNameVersionsVersionNameTarball.js"),
  require("./getPackagesPackageNameVersionsVersionName.js"),
  require("./getPackagesPackageNameStargazers.js"),
  require("./getPackagesPackageName.js"),
  require("./postPackagesPackageNameVersionsVersionNameEventsUninstall.js"),
  require("./postPackagesPackageNameVersions.js"),
  require("./postPackagesPackageNameStar.js"),
  require("./getUsersLoginStars.js"),
  require("./getUsersLogin.js"),
  require("./getOwnersOwnerName.js"),
];

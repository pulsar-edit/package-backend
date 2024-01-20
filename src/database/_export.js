/**
 * @desc Exposes all functions for the database, while also providing some default
 * values to each module.
 */

const fs = require("fs");
const postgres = require("postgres");
const logger = require("../logger.js");
const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_DB,
  DB_PORT,
  DB_SSL_CERT
} = require("../config.js").getConfig();

// While the below method of exporting the additional database modules is nonstandard
// it lets us accomplish several things:
//  - Consumers can call database.func() without issue while passing their own values
//  - Consumers can call database.func.value to get constants about the function
//  - Modules don't have to import the `sqlStorage` object into each one
//  - We can wrap all database modules in a `try...catch` to avoid having to do it
//    each time.

let sqlStorage; // SQL Object to interact with the DB
// It is set after the first call with logical nullish assignment

function setupSQL() {
  return process.env.PULSAR_STATUS === "dev" && process.env.MOCK_DB !== "false"
  ? postgres({
      host: DB_HOST,
      username: DB_USER,
      database: DB_DB,
      port: DB_PORT
  })
  : postgres({
      host: DB_HOST,
      username: DB_USER,
      password: DB_PASS,
      database: DB_DB,
      port: DB_PORT,
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(DB_SSL_CERT).toString()
      }
  });
}

function getSqlStorage() {
  return sqlStorage ??= setupSQL();
}

function wrapper(modToUse) {
  // Return this function passing all args based on what module we need to use
  return async (...args) => {
    // Wrap all function calls in a try catch with a singular error handler
    try {

      // Call the function passing the `sqlStorage` object can other provided params
      return modToUse.exec(getSqlStorage(), ...args);

    } catch(err) {
      // Generic Error Catcher for all database modules
      return {
        ok: false,
        content: "Generic Error",
        short: "server_error",
        error: err
      };

    }
  };
};

const exportObj = {
  shutdownSQL: async () => {
    if (sqlStorage !== undefined) {
      await sqlStorage.end();
      logger.generic(1, "SQL Server Shutdown!");
    }
  }
};

// Add all other modules here:
//  - First require only once on startup rather than during the command
//  - Then add the function as the default export of the object key
//  - Then we add the safe value to the object key

const keys = [
  "applyFeatures",
  "authCheckAndDeleteStateKey",
  "authStoreStateKey",
  "getFeaturedPackages",
  "getFeaturedThemes",
  "getPackageByName",
  "getPackageByNameSimple",
  "getPackageCollectionByID",
  "getPackageCollectionByName",
  "getPackageVersionByNameAndVersion",
  "getSortedPackages",
  "getStarredPointersByUserID",
  "getPackageCollectionByName",
  "getUserByID",
  "getUserByName",
  "getUserByNodeID",
  "getUserCollectionById",
  "insertNewPackage",
  "insertNewPackageName",
  "insertNewPackageVersion",
  "insertNewUser",
  "packageNameAvailability",
  "removePackageByName",
  "removePackageVersion",
  "updateDecrementStar",
  "updateIncrementStar",
  "updatePackageDecrementDownloadByName",
  "updatePackageIncrementDownloadByName",
  "updatePackageStargazers",
];

for (const key of keys) {
  let tmp = require(`./${key}.js`);
  exportObj[key] = wrapper(tmp);
  exportObj[key].safe = tmp.safe;
}

module.exports = exportObj;

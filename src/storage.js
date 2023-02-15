/**
 * @module storage
 * @desc This module is the second generation of data storage methodology,
 * in which this provides static access to files stored within regular cloud
 * file storage. Specifically intended for use with Google Cloud Storage.
 */

const { Storage } = require("@google-cloud/storage");
const logger = require("./logger.js");
const { CacheObject } = require("./cache.js");
const ServerStatus = require("./ServerStatusObject.js");
const { GCLOUD_STORAGE_BUCKET, GOOGLE_APPLICATION_CREDENTIALS } =
  require("./config.js").getConfig();

let gcsStorage;
let cachedBanlist, cachedFeaturedlist, cachedThemelist;

/**
 * @function setupGCS
 * @desc Sets up the Google Cloud Storage Class, to ensure its ready to use.
 * @returns {object} - A new Google Cloud Storage instance.
 */
function setupGCS() {
  return new Storage({
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  });
}

/**
 * @async
 * @function getBanList
 * @desc Reads the ban list from the Google Cloud Storage Space.
 * Returning the cached parsed JSON object.
 * If it has been read before during this instance of hosting just the cached
 * version is returned.
 * @returns {Array} Parsed JSON Array of all Banned Packages.
 */
async function getBanList() {
  gcsStorage ??= setupGCS();

  const getNew = async function () {
    if (
      GCLOUD_STORAGE_BUCKET === undefined ||
      GOOGLE_APPLICATION_CREDENTIALS === undefined ||
      (process.env.PULSAR_STATUS === "dev" &&
        process.env.MOCK_GOOGLE !== "false")
    ) {
      // This catches the instance when tests are being run, without access
      // or good reason to reach to 3rd party servers.
      // We will log a warning, and return preset test data.
      console.log("storage.js.getBanList() Returning Development Set of Data.");
      let list = ["slothoki", "slot-pulsa", "slot-dana", "hoki-slot"];
      cachedBanlist = new CacheObject(list);
      cachedBanlist.last_validate = Date.now();
      return new ServerStatus()
        .isOk()
        .setContent(cachedBanlist.data)
        .build();
    }

    try {
      let contents = await gcsStorage
        .bucket(GCLOUD_STORAGE_BUCKET)
        .file("name_ban_list.json")
        .download();
      cachedBanlist = new CacheObject(JSON.parse(contents));
      cachedBanlist.last_validate = Date.now();
      return new ServerStatus()
        .isOk()
        .setContent(cachedBanlist.data)
        .build();
    } catch (err) {
      return new ServerStatus()
        .notOk()
        .setShort("Server Error")
        .setContent(err)
        .build();
    }
  };

  if (cachedBanlist === undefined) {
    logger.generic(5, "Creating Ban List Cache.");
    return getNew();
  }

  if (!cachedBanlist.Expired) {
    logger.generic(5, "Ban List Cache NOT Expired.");
    return new ServerStatus()
      .isOk()
      .setContent(cachedBanlist.data)
      .build();
  }

  logger.generic(5, "Ban List Cache IS Expired.");
  return getNew();
}

/**
 * @async
 * @function getFeaturedPackages
 * @desc Returns the hardcoded featured packages file from Google Cloud Storage.
 * Caching the object once read for this instance of the server run.
 * @returns {Array} Parsed JSON Array of all Featured Packages.
 */
async function getFeaturedPackages() {
  gcsStorage ??= setupGCS();

  const getNew = async function () {
    if (
      GCLOUD_STORAGE_BUCKET === undefined ||
      GOOGLE_APPLICATION_CREDENTIALS === undefined ||
      (process.env.PULSAR_STATUS === "dev" &&
        process.env.MOCK_GOOGLE !== "false")
    ) {
      // This catches the instance when tests are being run, without access
      // or good reason to reach to 3rd party servers.
      // We will log a warning, and return preset test data.
      console.log(
        "storage.js.getFeaturedPackages() Returning Development Set of Data."
      );
      let list = ["hydrogen", "atom-clock", "hey-pane"];
      cachedFeaturedlist = new CacheObject(list);
      cachedFeaturedlist.last_validate = Date.now();
      return new ServerStatus()
        .isOk()
        .setContent(cachedFeaturedlist.data)
        .build();
    }

    try {
      let contents = await gcsStorage
        .bucket(GCLOUD_STORAGE_BUCKET)
        .file("featured_packages.json")
        .download();
      cachedFeaturedlist = new CacheObject(JSON.parse(contents));
      cachedFeaturedlist.last_validate = Date.now();
      return new ServerStatus()
        .isOk()
        .setContent(cachedFeaturedlist.data)
        .build();
    } catch (err) {
      return new ServerStatus()
        .notOk()
        .setShort("Server Error")
        .setContent(err)
        .build();
    }
  };

  if (cachedFeaturedlist === undefined) {
    logger.generic(5, "Creating Ban List Cache.");
    return getNew();
  }

  if (!cachedFeaturedlist.Expired) {
    logger.generic(5, "Ban List Cache NOT Expired.");
    return new ServerStatus()
      .isOk()
      .setContent(cachedFeaturedlist.data)
      .build();
  }

  logger.generic(5, "Ban List Cache IS Expired.");
  return getNew();
}

/**
 * @async
 * @function getFeaturedThemes
 * @desc Used to retrieve Google Cloud Storage Object for featured themes.
 * @returns {Array} JSON Parsed Array of Featured Theme Names.
 */
async function getFeaturedThemes() {
  gcsStorage ??= setupGCS();

  const getNew = async function () {
    if (
      GCLOUD_STORAGE_BUCKET === undefined ||
      GOOGLE_APPLICATION_CREDENTIALS === undefined ||
      (process.env.PULSAR_STATUS === "dev" &&
        process.env.MOCK_GOOGLE !== "false")
    ) {
      // This catches the instance when tests are being run, without access
      // or good reason to reach to 3rd party servers.
      // We will log a warning, and return preset test data.
      console.log(
        "storage.js.getFeaturedThemes() Returning Development Set of Data."
      );
      let list = ["atom-material-ui", "atom-material-syntax"];
      cachedThemelist = new CacheObject(list);
      cachedThemelist.last_validate = Date.now();
      return new ServerStatus()
        .isOk()
        .setContent(cachedThemelist.data)
        .build();
    }

    try {
      let contents = await gcsStorage
        .bucket(GCLOUD_STORAGE_BUCKET)
        .file("featured_themes.json")
        .download();
      cachedThemelist = new CacheObject(JSON.parse(contents));
      cachedThemelist.last_validate = Date.now();
      return new ServerStatus()
        .isOk()
        .setContent(cachedThemelist.data)
        .build();
    } catch (err) {
      return new ServerStatus()
        .notOk()
        .setShort("Server Error")
        .setContent(err)
        .build();
    }
  };

  if (cachedThemelist === undefined) {
    logger.generic(5, "Creating Theme List Cache");
    return getNew();
  }

  if (!cachedThemelist.Expired) {
    logger.generic(5, "Theme List Cache NOT Expired.");
    return new ServerStatus()
      .isOk()
      .setContent(cachedThemelist.data)
      .build();
  }

  logger.generic(5, "Theme List Cache IS Expired.");
  return getNew();
}

module.exports = {
  getBanList,
  getFeaturedPackages,
  getFeaturedThemes,
};

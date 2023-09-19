/**
 * @module storage
 * @desc This module is the second generation of data storage methodology,
 * in which this provides static access to files stored within regular cloud
 * file storage. Specifically intended for use with Google Cloud Storage.
 */

const { Storage } = require("@google-cloud/storage");
const logger = require("./logger.js");
const { CacheObject } = require("./cache.js");
const sso = require("./models/sso.js");
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

async function getGcpContent(file) {
  if (
    GOOGLE_APPLICATION_CREDENTIALS === "nofile" ||
    process.env.PULSAR_STATUS === "dev"
  ) {
    // This catches the instance when tests are being run, without access
    // or good reason to reach to 3rd party servers.
    // We will instead return local data
    // Setting GOOGLE_APPLICATION_CREDENTIALS to "nofile" will be the recommended
    // method for running locally.
    const fs = require("fs");
    const path = require("path");

    const contents = fs.readFileSync(path.resolve(`./docs/resources/${file}`), { encoding: "utf8" });
    return contents;
  } else {
    // This is a production request
    gcsStorage ??= setupGCS();

    const contents = await gcsStorage
      .bucket(GCLOUD_STORAGE_BUCKET)
      .file(file)
      .download();

    return contents;
  }
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

  const getNew = async function () {

    try {
      const contents = await getGcpContent("name_ban_list.json");

      cachedBanlist = new CacheObject(JSON.parse(contents));
      cachedBanlist.last_validate = Date.now();
      return new sso().isOk().addContent(cachedBanlist.data);
    } catch (err) {
      return new sso().notOk()
                      .addShort("server_error")
                      .addCalls("getGcpContent", err);
    }
  };

  if (cachedBanlist === undefined) {
    logger.generic(5, "Creating Ban List Cache.");
    return getNew();
  }

  if (!cachedBanlist.Expired) {
    logger.generic(5, "Ban List Cache NOT Expired.");
    return new sso().isOk().addContent(cachedBanlist.data);
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

  const getNew = async function () {

    try {
      const contents = await getGcpContent("featured_packages.json");

      cachedFeaturedlist = new CacheObject(JSON.parse(contents));
      cachedFeaturedlist.last_validate = Date.now();
      return new sso().isOk()
                      .addContent(cachedFeaturedlist.data);
    } catch (err) {
      return new sso().notOk()
                      .addShort("server_error")
                      .addCalls("getGcpContent", err);
    }
  };

  if (cachedFeaturedlist === undefined) {
    logger.generic(5, "Creating Ban List Cache.");
    return getNew();
  }

  if (!cachedFeaturedlist.Expired) {
    logger.generic(5, "Ban List Cache NOT Expired.");
    return new sso().isOk()
                    .addContent(cachedFeaturedlist.data);
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

  const getNew = async function () {

    try {
      const contents = await getGcpContent("featured_themes.json");

      cachedThemelist = new CacheObject(JSON.parse(contents));
      cachedThemelist.last_validate = Date.now();
      return new sso().isOk().addContent(cachedThemelist.data);
    } catch (err) {
      return new sso().notOk()
                      .addShort("server_error")
                      .addCalls("getGcpContent", err);
    }
  };

  if (cachedThemelist === undefined) {
    logger.generic(5, "Creating Theme List Cache");
    return getNew();
  }

  if (!cachedThemelist.Expired) {
    logger.generic(5, "Theme List Cache NOT Expired.");
    return new sso().isOk().addContent(cachedThemelist.data);
  }

  logger.generic(5, "Theme List Cache IS Expired.");
  return getNew();
}

module.exports = {
  getBanList,
  getFeaturedPackages,
  getFeaturedThemes,
};

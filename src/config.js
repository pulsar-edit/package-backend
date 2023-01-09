/**
 * @module config
 * @desc Module that access' and returns the server wide configuration.
 */

const fs = require("fs");
const yaml = require("js-yaml");

/**
 * @function getConfigFile
 * @desc Used to read the `yaml` config file from the root of the project.
 * Returning the YAML parsed file, or an empty obj.
 * @returns {object} A parsed YAML file config, or an empty object.
 */
function getConfigFile() {
  try {
    let data = null;

    try {
      let fileContent = fs.readFileSync("./app.yaml", "utf8");
      data = yaml.load(fileContent);
    } catch (err) {
      if (
        process.env.NODE_ENV !== "production" &&
        process.env.NODE_ENV !== "test"
      ) {
        console.log(`Failed to load app.yaml in non-production env! ${err}`);
        process.exit(1);
      } else {
        // While we want to continue, to grab variables from just the env,
        // We will assign the base object to data, to help prevent tests from failing.
        data = {
          env_variables: {},
        };
      }
    }

    return data;
  } catch (err) {
    // since this is necessary for the server to startup, we can throw an error here and exit the process.
    console.error(err);
    process.exit(1);
  }
}

/**
 * @desc Used to get Server Config data from the `app.yaml` file at the root of the project.
 * Or from environment variables. Prioritizing environment variables.
 * @function getConfig
 * @return {object} The different available configuration values.
 * @example <caption>Using `getConfig()` during an import for a single value.</caption>
 * const { search_algorithm } = require("./config.js").getConfig();
 */
function getConfig() {
  let data = getConfigFile();

  // now we should have the data as a JSON object.

  // But we will create a custom object here to return, with all values, and choosing between the env vars and config
  // Since if this is moved to Google App Engine, these variables will all be environment variables. So we will look for both.

  return {
    port: process.env.PORT ?? data.env_variables.PORT,
    server_url: process.env.SERVERURL ?? data.env_variables.SERVERURL,
    paginated_amount: process.env.PAGINATE ?? data.env_variables.PAGINATE,
    prod: process.env.NODE_ENV === "production" ? true : false,
    cache_time: process.env.CACHETIME ?? data.env_variables.CACHETIME,
    GCLOUD_STORAGE_BUCKET:
      process.env.GCLOUD_STORAGE_BUCKET ??
      data.env_variables.GCLOUD_STORAGE_BUCKET,
    GOOGLE_APPLICATION_CREDENTIALS:
      process.env.GOOGLE_APPLICATION_CREDENTIALS ??
      data.env_variables.GOOGLE_APPLICATION_CREDENTIALS,
    GH_CLIENTID: process.env.GH_CLIENTID ?? data.env_variables.GH_CLIENTID,
    GH_USERAGENT: process.env.GH_USERAGENT ?? data.env_variables.GH_USERAGENT,
    GH_REDIRECTURI:
      process.env.GH_REDIRECTURI ?? data.env_variables.GH_REDIRECTURI,
    GH_CLIENTSECRET:
      process.env.GH_CLIENTSECRET ?? data.env_variables.GH_CLIENTSECRET,
    DB_HOST: process.env.DB_HOST ?? data.env_variables.DB_HOST,
    DB_USER: process.env.DB_USER ?? data.env_variables.DB_USER,
    DB_PASS: process.env.DB_PASS ?? data.env_variables.DB_PASS,
    DB_DB: process.env.DB_DB ?? data.env_variables.DB_DB,
    DB_PORT: process.env.DB_PORT ?? data.env_variables.DB_PORT,
    DB_SSL_CERT: process.env.DB_SSL_CERT ?? data.env_variables.DB_SSL_CERT,
    LOG_LEVEL: process.env.LOG_LEVEL ?? data.env_variables.LOG_LEVEL,
    LOG_FORMAT: process.env.LOG_FORMAT ?? data.env_variables.LOG_FORMAT,
  };
}

module.exports = {
  getConfig,
};

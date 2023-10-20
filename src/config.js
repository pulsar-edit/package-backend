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

  const findValue = (key, def) => {
    return process.env[key] ?? data.env_variables[key] ?? def ?? undefined;
  };

  return {
    port: findValue("PORT", 8080),
    server_url: findValue("SERVERURL"),
    paginated_amount: findValue("PAGINATE", 30),
    prod: process.env.NODE_ENV === "production" ? true : false,
    cache_time: findValue("CACHETIME"),
    GCLOUD_STORAGE_BUCKET: findValue("GCLOUD_STORAGE_BUCKET"),
    GOOGLE_APPLICATION_CREDENTIALS: findValue("GOOGLE_APPLICATION_CREDENTIALS"),
    GH_CLIENTID: findValue("GH_CLIENTID"),
    GH_CLIENTSECRET: findValue("GH_CLIENTSECRET"),
    GH_USERAGENT: findValue("GH_USERAGENT"), // todo maybe default?
    GH_REDIRECTURI: findValue("GH_REDIRECTURI"),
    DB_HOST: findValue("DB_HOST"),
    DB_USER: findValue("DB_USER"),
    DB_PASS: findValue("DB_PASS"),
    DB_DB: findValue("DB_DB"),
    DB_PORT: findValue("DB_PORT"),
    DB_SSL_CERT: findValue("DB_SSL_CERT"),
    LOG_LEVEL: findValue("LOG_LEVEL", 6),
    LOG_FORMAT: findValue("LOG_FORMAT", "stdout"),
    RATE_LIMIT_GENERIC: findValue("RATE_LIMIT_GENERIC"),
    RATE_LIMIT_AUTH: findValue("RATE_LIMIT_AUTH"),
    WEBHOOK_PUBLISH: findValue("WEBHOOK_PUBLISH"),
    WEBHOOK_VERSION: findValue("WEBHOOK_VERSION"),
    WEBHOOK_USERNAME: findValue("WEBHOOK_USERNAME"),
  };
}

module.exports = {
  getConfig,
};

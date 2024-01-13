/**
 * @module query
 * @desc Home to parsing all query parameters from the `Request` object. Ensuring a valid response.
 * While most values will just return their default there are some expecptions:
 * engine(): Returns false if not defined, to allow a fast way to determine if results need to be pruned.
 */

const auth = require("./auth.js");
const direction = require("./direction.js");
const engine = require("./engine.js");
const fileExtension = require("./fileExtension.js");
const filter = require("./filter.js");
const login = require("./login.js");
const owner = require("./owner.js");
const packageName = require("./packageName.js");
const page = require("./page.js");
const query = require("./query.js");
const rename = require("./rename.js");
const repo = require("./repo.js");
const service = require("./service.js");
const serviceType = require("./serviceType.js");
const serviceVersion = require("./serviceVersion.js");
const sort = require("./sort.js");
const tag = require("./tag.js");
const versionName = require("./versionName.js");

module.exports = {
  logic: {
    auth: auth.logic,
    direction: direction.logic,
    engine: engine.logic,
    fileExtension: fileExtension.logic,
    filter: filter.logic,
    login: login.logic,
    owner: owner.logic,
    packageName: packageName.logic,
    page: page.logic,
    query: query.logic,
    rename: rename.logic,
    repo: repo.logic,
    service: service.logic,
    serviceType: serviceType.logic,
    serviceVersion: serviceVersion.logic,
    sort: sort.logic,
    tag: tag.logic,
    versionName: versionName.logic,
  },
  schema: {
    auth: auth.schema,
    direction: direction.schema,
    engine: engine.schema,
    fileExtension: fileExtension.schema,
    filter: filter.schema,
    login: login.schema,
    owner: owner.schema,
    packageName: packageName.schema,
    page: page.schema,
    query: query.schema,
    rename: rename.schema,
    repo: repo.schema,
    service: service.schema,
    serviceType: serviceType.schema,
    serviceVersion: serviceVersion.schema,
    sort: sort.schema,
    tag: tag.schema,
    versionName: versionName.schema,
  },
};

// This module will provide a setup for the *.handler.integration.test.js files.
// This mainly means to properly set timeouts, and to ensure that required
// env vars are set properly.

//jest.setTimeout(3000000);

const dbUrl = process.env.DATABASE_URL;
// this gives us something like postgres://test-user@localhost:5432/test-db
// We then need to map these values to where the API server expects,
const dbUrlReg = /postgres:\/\/([\/\S]+)@([\/\S]+):(\d+)\/([\/\S]+)/;
const dbUrlParsed = dbUrlReg.exec(dbUrl);

// set the parsed URL as proper env
process.env.DB_HOST = dbUrlParsed[2];
process.env.DB_USER = dbUrlParsed[1];
process.env.DB_DB = dbUrlParsed[4];
process.env.DB_PORT = dbUrlParsed[3];

// Then since we want to make sure we don't initialize the config module, before we have set our values,
// we will define our own port to use here.
process.env.PORT = 8080;

// Now any tests that have this called prior to the test being run can `require("../main.js")`
// without any issue

// But now lets setup some global objects for tests to rely on

global.msg = {
  badRepoJSON:
    "That repo does not exist, isn't an atom package, or atombot does not have access.",
  badAuth:
    "Requires authentication. Please update your token if you haven't done so recently.",
  notSupported: "While under development this feature is not supported.",
  publishPackageExists: "A Package by that name already exists.",
  notFound: "Not Found",
  notFoundSite: "This is a standin for the proper site wide 404 page.",
  serverError: "Application Error",
  badPackageJSON: "The package.json at owner/repo isn't valid.",
};

/**
 * @module dev_server
 * @desc The Development initializer of `main.js` as well as managing the startup of a locally created Docker SQL
 * Server. This uses pg-test to set up a database hosted on local Docker. Migrating all data as needed,
 * to allow the real server feel, without having access or the risk of the production database. But otherwise runs
 * the backend API server as normal.
 */

/**
 * This is the recommended and only way to mock how Jest would use the module.
 */
const dbSetup = require("../node_modules/@databases/pg-test/jest/globalSetup");
const dbTeardown = require("../node_modules/@databases/pg-test/jest/globalTeardown");

async function test() {
  await processArgs();

  if (process.env.MOCK_DB != "false") {
    // We only Mock the Database if our argument flags permit.
    console.log("Setting up Database Mock");

    await dbSetup();

    // lets take the value made by the test runner database, and put it where the api server expects.
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
  }

  const app = require("./main.js");
  const logger = require("./logger.js");
  const database = require("./database.js");
  // We can only require these items after we have set our env variables

  if (process.env.MOCK_DB != "false") {
    logger.generic(
      3,
      "Pulsar Server is in Development Mode with a Local Database!"
    );

    logger.generic(6, "Dev DB Configured Environment Variables.", {
      type: "object",
      obj: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DB,
        port: process.env.DB_PORT,
      },
    });
  }

  const serve = app.listen(process.env.PORT, () => {
    logger.generic(3, `Pulsar Server Listening on port ${process.env.PORT}`);
  });

  process.on("SIGTERM", async () => {
    await localExterminate("SIGTERM", serve, database);
  });

  process.on("SIGINT", async () => {
    await localExterminate("SIGINT", serve, database);
  });
}

/**
 * @async
 * @function localExterminate
 * @desc Similar to `server.js` exterminate(), except used for the `dev_server.js` instance.
 * @param {string} callee - Simply a way to better log what called the server to shutdown.
 * @param {object} serve - The instance of the ExpressJS `app` that has started listening and can be called to shutdown.
 * @param {object} db - The instance of the `database.js` module, used to properly close its connections during a
 * graceful shutdown.
 */
async function localExterminate(callee, serve, db) {
  console.log(`${callee} signal received: closing HTTP server.`);
  await db.shutdownSQL();
  await dbTeardown();
  console.log("Exiting...");
  serve.close(() => {
    console.log("HTTP Server Closed.");
  });
}

async function processArgs() {
  let rawArgs = process.argv.slice(2);

  for (let i = 0; i < rawArgs.length; i++) {
    if (rawArgs[i] == "--gh") {
      console.log("Setting No Mock GitHub");
      process.env.MOCK_GH = "false";
    }
    if (rawArgs[i] == "--google") {
      console.log("Setting No Mock Google");
      process.env.MOCK_GOOGLE = "false";
    }
    if (rawArgs[i] == "--db") {
      console.log("Setting No Mock Database");
      process.env.MOCK_DB = "false";
    }
    if (rawArgs[i] == "--auth") {
      console.log("Setting No Mock Authentication");
      process.env.MOCK_AUTH = "false";
    }
  }

  return;
}

test();

/**
The purpose of this script will be to manually run certain enabled
health checks agains the packages on the Pulsar Registry.

While initially these will be only to alert of any issues,
ideally in the future this could work to resolve the issues as well.

Each healthcheck function should return a string of the issue, or return `false`
if there is no issue present. Or otherwise log why it can't find an issue, returning false.

Usage:
  npm run tool:health <services to enable seperated by spaces>
  npm run tool:health mode=read
  npm run tool:health verbose saveJSON mode=read packageMetadata

Arguments:
  * mode=<read|write> : Specifies if the health check should attempt automatic fixes
                        By default runs in readonly mode.
  * verbose : Should it run in verbose mode.
  * saveJSON : Should the results be saved to the file system as JSON
  * limit=<integer> : Set a custom limit, to avoid running the check on the entire DB.
  * loading=<value> : Sets the loading animation to use. When verbose is set, a loading
                      appear instead. Valid values:
                      - dots : Displays a dot for each package being checked.
                      - none : Outputs nothing.
  * packageMetadata : Runs the checks to validate the package's `data` field.

Notes:
  - This script does rely on `./src/config.js` to collect db connection configuration
*/

const fs = require("fs");
const postgres = require("postgres");
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } = require("../../src/config.js").getConfig();

let sqlStorage;

let config = {
  read: true,
  saveJSON: false,
  verbose: false,
  useLimit: false,
  limit: 0,
  loading: 'dots',
  packageMetadata: false,
};

async function init(params) {

  let results = [];

  for (const param of params) {
    if (param === "mode=read") {
      config.read = true;
    }
    if (param === "mode=write") {
      config.read = false;
    }
    if (param === "saveJSON") {
      config.saveJSON = true;
    }
    if (param === "verbose") {
      config.verbose = true;
    }
    if (param.startsWith("limit=")) {
      config.limit = parseInt(param.replace("limit=", ""));
      config.useLimit = true;
    }
    if (param.startsWith("loading=")) {
      config.loading = param.replace("loading=", "");
    }
    if (param === "packageMetadata") {
      config.packageMetadata = true;
    }
  }


  if (config.read) {
    console.log("Health Check running in readonly mode.");
  } else {
    console.log("Health Check is running in write mode!");
  }

  const allPointers = await getPointers();

  for (const pointer of allPointers) {
    // Provides the function the { name: '', pointer: '' }
    if (config.packageMetadata) {
      if (config.verbose) {
        console.log(`Checking: ${pointer.name}::${pointer.pointer}`);
      } else {
        // Since this can be a long running task, we will output a loading bar.
        if (config.loading === "dots") {
          process.stdout.write(".");
        }
      }

      let tmp = await validatePackageMetadata(pointer);

      if (typeof tmp === "string") {
        results.push(tmp);
      }
    }

  }

  // Now to log the results
  console.log("\n"); // Newline to ensure the loading doesn't appear
  for (const res of results) {
    console.log(res);
  }

  if (config.saveJSON) {
    fs.writeFileSync("./health-check-output.json", JSON.stringify(results, null, 2));
  }

  process.exit(0);
}

function setupSQL() {
  try {
    sqlStorage = postgres({
      host: DB_HOST,
      username: DB_USER,
      password: DB_PASS,
      database: DB_DB,
      port: DB_PORT,
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(DB_SSL_CERT).toString(),
      },
    });

    return sqlStorage;

  } catch(err) {
    console.log(err);
    process.exit(100);
  }
}

async function sqlEnd() {
  if (sqlStorage !== undefined) {
    await sqlStorage.end();
    console.log("SQL Server Disconnected!");
  }
  return;
}

async function getPointers() {
  sqlStorage ??= setupSQL();

  let command;

  if (config.useLimit) {
    command = await sqlStorage`
      SELECT * FROM names LIMIT ${config.limit};
    `;
  } else {
    command = await sqlStorage`
      SELECT * FROM names;
    `;
  }

  if (command.count === 0) {
    console.log("Failed to get all package pointers.");
    await sqlEnd();
    process.exit(1);
  }

  return command;
}

async function getPackageData(pointer) {
  sqlStorage ??= setupSQL();

  const command = await sqlStorage`
    SELECT * from packages
    WHERE pointer = ${pointer}
  `;

  if (command.count === 0) {
    return { ok: false, content: `Failed to get package data of ${pointer}` };
  }

  return { ok: true, content: command[0] };
}

async function validatePackageMetadata(pointer) {
  let packData = await getPackageData(pointer.pointer);

  if (!packData.ok) {
    console.log(packData.content);
    return false;
  }

  let data = packData.content.data;

  if (
    typeof data.name === "string" &&
    typeof data.readme === "string" &&
    typeof data.repository?.url === "string" &&
    typeof data.repository?.type === "string" &&
    typeof data.metadata === "object"
  ) {
    return false;
  } else {
    return `The package ${pointer.name}::${pointer.pointer} has invalid Package Metadata!`;
  }

}

init(process.argv.slice(2));

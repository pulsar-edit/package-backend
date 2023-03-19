/**
Super simple, likely a one time run.

Collect all licenses from a list of packages.

Usage:
  npm run tool:license name=package
  npm run tool:license array

You can either fill in the `MULTIPLE_PACKAGES` array with names of packages
or you can provide a single package when calling the script via the CLI.

*/

const MULTIPLE_PACKAGES = [];

const fs = require("fs");
const postgres = require("postgres");
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } =
  require("../../src/config.js").getConfig();

let sqlStorage;

async function init(params) {
  let name;

  let config = {
    single: false,
    multiple: false,
  };

  for (const param of params) {
    if (param.startsWith("name=")) {
      name = param.replace("name=", "");
      config.single = true;
    }
    if (param === "array") {
      config.multiple = true;
    }
  }

  if (config.single && config.multiple) {
    console.log("Cannot use both named gathering and array gathering!");
    process.exit(1);
  }

  if (config.single) {
    await main(name);
    await sqlEnd();
    process.exit(1);
  }

  if (config.multiple) {
    if (MULTIPLE_PACKAGES.length === 0) {
      console.log("No entries provided for multiple gathering!");
      process.exit(1);
    }

    for (const package of MULTIPLE_PACKAGES) {
      await main(package);
    }

    await sqlEnd();
  }

  console.log("Done");
  process.exit(0);
}

async function main(name) {
  let pointer;

  if (typeof name !== "string") {
    console.log(`Unexpected name parameter: ${name} of ${typeof name}!`);
    console.log("Expected a string.");
    process.exit(1);
  }

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

    const command = await sqlStorage`
      SELECT pointer FROM names
      WHERE name = ${name};
    `;

    if (command.count === 0) {
      console.log(`Package ${name} not found!`);
      await sqlEnd();
      process.exit(1);
    }

    pointer = command[0].pointer;

    const license = await getLicense(pointer, name);

    if (!license.ok) {
      console.log("An error occured getting the license!");
      console.log(license.content);
      await sqlEnd();
      process.exit(1);
    }

    console.log(`${name}::${pointer} - ${license.content}`);
    return;
  } catch (err) {
    console.log(err);
    console.log("Something has gone wrong!");
    await sqlEnd();
    process.exit(1);
  }
}

async function sqlEnd() {
  if (sqlStorage !== undefined) {
    await sqlStorage.end();
    console.log("SQL Server Disconnected!");
  }
  return;
}

async function getLicense(pointer, name) {
  const command = await sqlStorage`
    SELECT license from versions
    WHERE package = ${pointer} AND status = 'latest';
  `;

  if (command.count === 0) {
    return {
      ok: false,
      content: `Failed to get license of ${name}::${pointer}`,
    };
  }

  return { ok: true, content: command[0].license };
}

init(process.argv.slice(2));

/**
Provides the ability to delete a package from the Pulsar Registry by name alone.
This will not remove the name from the system to prevent a Supply Chain Attack

Providing a specific `name=` to a package will only delete that package.
Setting `array` as the config during deletion will then check the variable
  `MULTIPLE_DELETIONS` and will loop through all package names within to delete all of them.

Usage:
  npm run tool:delete name=atom
  node ./scripts/tools/manual-delete-package.js name=atom
  npm run tool:delete array
  node ./scripts/tools/manual-delete-package.js array

Notes:
  - This script does rely on `./src/config.js` to collect db connection configuration data

*/

const MULTIPLE_DELETIONS = [];

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
    console.log("Cannot use both named deletion and array deletion!");
    process.exit(1);
  }

  if (config.single) {
    // We will call the main function with our single name
    await main(name);
    await sqlEnd();
    process.exit(1);
  }

  if (config.multiple) {
    // We will loop through all values and delete as needed
    if (MULTIPLE_DELETIONS.length === 0) {
      console.log("No entries provided for multiple deletions!");
      process.exit(1);
    }

    for (let i = 0; i < MULTIPLE_DELETIONS.length; i++) {
      await main(MULTIPLE_DELETIONS[i]);
    }

    await sqlEnd();
  }

  console.log("Done");
  process.exit(1);
}

async function main(params) {
  let name;
  let pointer;

  for (const param of params) {
    if (param.startsWith("name=")) {
      name = param.replace("name=", "");
    }
  }

  if (typeof name !== "string") {
    console.log(`Unexpected parameter: ${name} of ${typeof name}!`);
    console.log("Expected a string.");
    process.exit(1);
  }

  try {
    // Setup our SQL Connection
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

    // Now lets get the packages ID
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

    // Now with the pointer it's time to delete the whole package
    const remove = await removePackage(pointer, name);

    if (!remove.ok) {
      console.log("An error occured while deleting the package!");
      console.log(remove.content);
      await sqlEnd();
      process.exit(1);
    }

    console.log(
      `Removed ${name}:${pointer} successfully and permenantly from the DB`
    );
    return;
  } catch (err) {
    console.log(err);
    console.log("Something has gone wrong!");

    // Then in case it wasn't done yet disconnect from the DB
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

async function removePackage(pointer, name) {
  return await sqlStorage
    .begin(async (sqlTrans) => {
      // Remove versions of the package
      const commandVers = await sqlTrans`
        DELETE FROM versions
        WHERE package = ${pointer}
        RETURNING semver;
      `;

      if (commandVers.count === 0) {
        throw `Failed to delete any versions for: ${name}`;
      }

      // Remove stars assigned to the package
      await sqlTrans`
        DELETE FROM stars
        WHERE package = ${pointer}
        RETURNING userid;
      `;
      // A package may not contain stars so we don't check it's return

      // Delete the actual package data
      const commandPack = await sqlTrans`
        DELETE FROM packages
        WHERE pointer = ${pointer}
        RETURNING name;
      `;

      if (commandPack.count === 0) {
        throw `Failed to Delete Package for: ${name}`;
      }

      if (commandPack[0].name !== name) {
        throw `Attempted to delete ${commandPack[0].name} rather than ${name}!`;
      }

      // Now we have successfully deleted the package
      return {
        ok: true,
        content: "",
      };
    })
    .catch((err) => {
      return { ok: false, content: err };
    });
}

init(process.argv.slice(2));

/**
  This tool should only ever have to be run once, that is exactly after PR
  https://github.com/pulsar-edit/package-backend/pull/307 is merged.

  This PR fixes the behavior that would incorrectly modify the `updated` column
  of all packages whenever any data about them has been modified. including
  columns such as `downloads`, `stargazers_count`, etc.

  So this tool will iterate all existing packages, and change the `updated` column
  of the package to reflect that of the packages latest versions `creation` timestamp.
*/

const fs = require("fs");
const postgres = require("postgres");
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } =
  require("../../src/config.js").getConfig();

let sqlStorage;

async function init(params) {
  sqlStorage ??= setupSQL();

  const allPointers = await getPointers();
  const totalPointers = allPointers.length;
  let pointerIdx = 0;
  let results = [];

  for await (const pointer of allPointers) {
    const referenceStr = `'${pointer.name}::${pointer.pointer}'`;

    try {
      console.log(`Checking: ${referenceStr}`);
      console.log(`\r[${pointerIdx}/${totalPointers}] Packages Checked...`);
      pointerIdx++;

      if (typeof pointer.name !== "string" || typeof pointer.pointer !== "string") {
        let str = `The package '${referenceStr}' is missing a required value!`;
        console.log(str);
        results.push(str);
        continue;
      }

      /**
        1. Find the latest version for this pacakge.
        2. Collect that version from the DB
        3. Find the `created` timestamp of that version
        4. Update the DB for the packages `updated` column to match it's latest versions
           `created` column.
      */

      let pack = await getPackageData(pointer.pointer);

      if (!pack.ok) {
        results.push(`Failed to collect package data for ${referenceStr}`);
        continue;
      }

      let latestVer = pack.content?.metadata?.version;

      if (typeof latestVer !== "string") {
        results.push(`Failed to determine latest version for ${referenceStr}`);
        continue;
      }

      // Get this latest version
      let verData = await getVersionData(pointer.pointer, latestVer);

      if (!verData.ok) {
        results.push(`Failed to collect package version data for ${referenceStr}`);
        continue;
      }

      let verCreation = verData.content?.created;
      let originalCreation = pack.content?.updated;

      if (typeof verCreation !== "string") {
        results.push(`Failed to collect created date of ${referenceStr} for version: '${latestVer}'`);
        continue;
      }

      let updatePack = await modifyPackUpdatedDate(pointer.pointer, verCreation);

      if (!updatePack.ok) {
        results.push(`Failed to update package 'updated' timestamp ${referenceStr}`);
        continue;
      }

      results.push(`Successfully updated ${referenceStr}; from '${originalCreation}' to '${verCreation}'`);

    } catch(err) {
      console.error(err);
      const str = `Critical error occured for '${pointer.pointer}': '${err.toString()}'`;
      console.error(str);
      console.error("Waiting 5 seconds for manual intervention!");
      await new Promise((r) => setTimeout(r, 5000));
      // ^^ Allow a small timeout to ensure I can quite if something has gone
      // TERRIBLY wrong.
      console.log("Continuing run...");
      results.push(str);
    }
  }

  fs.writeFileSync(`${__dirname}/fix-updated-column.results.json`, JSON.stringify(results, null, 2));
  console.log(results);
  console.log("\n\nTask Completed!");
  await sqlEnd();
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
  } catch (err) {
    console.log(err);
    process.exit(100);
  }
}

async function getPointers() {
  sqlStorage ??= setupSQL();

  const command = await sqlStorage`
    SELECT * FROM names;
  `;

  if (command.count === 0) {
    console.log("Failed to get all package pointers.");
    await sqlEnd();
    process.exit(1);
  }
  return command;
}

async function sqlEnd() {
  if (sqlStorage !== undefined) {
    await sqlStorage.end();
    console.log("SQL Server Disconnected!");
  }
  return;
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

async function getVersionData(pointer, ver) {
  sqlStorage ??= setupSQL();

  const command = await sqlStorage`
    SELECT * FROM versions
    WHERE package = ${pointer} AND semver = ${ver}
  `;

  if (command.count === 0) {
    return { ok: false, content: `Failed to get pacakge version data of ${pointer}` };
  } else {
    return { ok: true, content: command[0] };
  }
}

async function modifyPackUpdatedDate(pointer, newDate) {
  sqlStorage ??= setupSQL();

  const command = await sqlStorage`
    UPDATE packages
    SET updated = ${newDate}
    WHERE pointer = ${pointer};
  `;

  if (command.count === 0) {
    return { ok: false, content: `Failed to update package '${pointer}' with new date: '${newDate}'` };
  } else {
    return { ok: true, content: command[0] };
  }
}

(async () => {
  await init();
})();

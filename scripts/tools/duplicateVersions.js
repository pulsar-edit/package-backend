/**
 * This file is being created to help us determine the way to strengthen our
 * sorting of versions.
 * Since after recent changes, we intended to update the production database
 * only to find out that several packages weren't compatible.
 * This script serves as a method to help determine the scope of incompatibility
 * within the production database.
 *
 *
 * This file should be run with:
 * - First export setupSQL from database.js
 * - Run on the CLI with: `node ./scripts/tools/duplicateVersions.js`
 */

const database = require("../../src/database.js");

sqlStorage = database.setupSQL();

async function checkDuplicates() {
  try {

    const command = await sqlStorage`
      SELECT p.pointer, p.name, v.semver_v1, v.semver_v2, v.semver_v3, COUNT(*) AS vcount
      FROM packages p INNER JOIN versions V ON p.pointer = v.package
      GROUP BY p.pointer, v.semver_v1, v.semver_v2, v.semver_v3
      HAVING COUNT(*) > 1
      ORDER BY vcount DESC, p.name, v.semver_v1, v.semver_v2, v.semver_v3;
    `;

    if (command.count === 0) {
      return "No packages with duplicated versions.\n";
    }

    let str = "";
    let packs = [];

    for (const v of command) {
      const latest = await latestVersion(v.pointer);

      if (latest === "") {
        str += `Cannot retrieve latest version for ${v.name} package.\n`;
        continue;
      }

      const semver = `${v.semver_v1}.${v.semver_v2}.${v.semver_v3}`;
      const isLatest = semver === latest;

      str += `Version ${semver} of package ${v.name} is ${isLatest ? "" : "NOT "} the latest.\n`;

      if(!packs.includes(v.pointer)) {
        packs.push(v.pointer);
      }
    }

    str += `\n${packs.length} packages have duplicated versions.\n`;

    return str;

  } catch(err) {
    return err;
  }
}

async function latestVersion(p) {
  console.log(`latestVersion: ${p}`);
  try {
    const command = await sqlStorage`
      SELECT semver_v1, semver_v2, semver_v3
      FROM versions
      WHERE package = ${p} AND status != 'removed'
      ORDER BY semver_v1 DESC, semver_v2 DESC, semver_v3 DESC;
    `;

    return command.count !== 0
      ? `${command[0].semver_v1}.${command[0].semver_v2}.${command[0].semver_v3}`
      : "";

  } catch(err) {
    return "";
  }
}

(async () => {
  let res = await checkDuplicates();

  console.log(res);
  process.exit(0);
})();

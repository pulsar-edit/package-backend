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
    const duplicates = await getDuplicates();

    let str = "";
    let packs = [];

    for (const v of duplicates) {
      const latest = await latestVersion(v.pointer);

      if (latest === "") {
        str += `Cannot retrieve latest version for ${v.name} package.\n`;
        continue;
      }

      const semver = `${v.semver_v1}.${v.semver_v2}.${v.semver_v3}`;
      const isLatest = semver === latest;

      str += `Version ${semver} of package ${v.name} is ${isLatest ? "" : "NOT"} the latest.\n`;

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

async function removeDuplicatesNotLatest() {
  try {
    const duplicates = await getDuplicates();

    let str = "";

    for (const v of duplicates) {
      const latest = await latestVersion(v.pointer);

      if (latest === "") {
        str += `Cannot retrieve latest version for ${v.name} package.\n`;
        continue;
      }

      const semver = `${v.semver_v1}.${v.semver_v2}.${v.semver_v3}`;
      const isLatest = semver === latest;

      if (isLatest) {
        continue;
      }

      const removeVersions = await removeVersionsBySemver(
        v.pointer,
        v.semver_v1,
        v.semver_v2,
        v.semver_v3,
      );

      str += (removeVersions !== 0)
        ? `Versions ${semver} of package ${v.name} have been deleted.\n`
        : `Cannot delete versions ${semver} of package ${v.name}!\n`;
    }

    return str;
  } catch(err) {
    return err;
  }
}

async function getDuplicates() {
  try {
    const command = await sqlStorage`
      SELECT p.pointer, p.name, v.semver_v1, v.semver_v2, v.semver_v3, COUNT(*) AS vcount
      FROM packages p INNER JOIN versions V ON p.pointer = v.package
      GROUP BY p.pointer, v.semver_v1, v.semver_v2, v.semver_v3
      HAVING COUNT(*) > 1
      ORDER BY vcount DESC, p.name, v.semver_v1, v.semver_v2, v.semver_v3;
    `;

    return command.count !== 0
      ? command
      : [];
  } catch (e) {
    return [];
  }
}

async function latestVersion(p) {
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

async function removeVersionsBySemver(pack, sv1, sv2, sv3) {
  try {
    const command = await sqlStorage`
      DELETE FROM versions
      WHERE package = ${pack} AND semver_v1 = ${sv1} AND
        semver_v2 = ${sv2} AND semver_v3 = ${sv3}
      RETURNING *;
    `;

    return command.count;
  } catch (e) {
    return 0;
  }
}

(async () => {
  let res = await removeDuplicatesNotLatest();

  console.log(res);
  process.exit(0);
})();

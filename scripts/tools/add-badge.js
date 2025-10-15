/**
 Script to add a badge to a specific package.

 Just update the `badgeConfig` and `packageName` fields in this file then run the script
 to trigger any badge additions needed.

 The script will do it's best to verify the data being added when it runs, but
 ensure to not leave any empty fields in `badgeConfig`
*/
const postgres = require("postgres");
const fs = require("fs");
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } =
  require("../../src/config.js").getConfig();

let sqlStorage;

/**
 @see https://github.com/pulsar-edit/package-backend/blob/main/docs/reference/badge-spec.md
 Valid Values:
  - type: <enum|required> The type of badge (info, warn, success)
  - title: <enum|required> The title of the badge (outdated, broken, archived). Uppercase.
  - text: <string|optional> The text content of the badge (no periods, fewest words possible)
  - link: <string|optional> A link for the badge (link to admin actions log)
  - alt: <string|optional> The alternate name to add for deprecated packages.

 Recommended values per title:
 - Deprecated: <warn> Installation of fork recommended
 - Broken: <warn> Known to be non-functional
 - Archived: <info> Source Code has been archived
 - Outdated: <warn> GitHub Installation Recommended
*/
let badgeConfig = {
  type: "",
  title: "",
  text: "",
  link: "https://github.com/pulsar-edit/package-backend/blob/main/docs/reference/Admin_Actions.md#2025---october-12",
  //alt: ""
};

let packageName = "";

const VALID_BADGES = ["Outdated", "Broken", "Archived", "Deprecated"];
const VALID_BADGES_TYPES = ["warn", "info", "success"];

async function main() {
  if (typeof badgeConfig !== "object") {
    console.error("Invalid Badge Config!");
    process.exit(100);
  }
  if (typeof packageName !== "string") {
    console.error("Invalid Badge Config Target!");
    process.exit(100);
  }
  if (typeof badgeConfig.title !== "string") {
    console.error("Invalid Badge Config Title!");
    process.exit(100);
  }
  if (!VALID_BADGES.includes(badgeConfig.title)) {
    console.error(`Unrecognized Badge Config Title: ${badgeConfig.title}!`);
    process.exit(100);
  }
  if (!VALID_BADGES_TYPES.includes(badgeConfig.type)) {
    console.error(`Unrecognized Badge Config Type: ${badgeConfig.type}!`);
    process.exit(100);
  }
  if (badgeConfig.type && badgeConfig.type.length < 1) {
    console.error("Zero lengthed entry of Badge Config Type!");
    process.exit(100);
  }
  if (badgeConfig.title && badgeConfig.title.length < 1) {
    console.error("Zero lengthed entry of Badge Config Title!");
    process.exit(100);
  }
  if (badgeConfig.text && badgeConfig.text.length < 1) {
    console.error("Zero lengthed entry of Badge Config Text!");
    process.exit(100);
  }
  if (badgeConfig.link && badgeConfig.link.length < 1) {
    console.error("Zero lengthed entry of Badge Config link!");
    process.exit(100);
  }
  if (badgeConfig.alt && badgeConfig.alt.length < 1) {
    console.error("Zero lengthed entry of Badge Config alt!");
    process.exit(100);
  }

  console.log(`Adding the following badge to ${packageName}`);
  console.log(badgeConfig);

  try {
    // Setup our SQL connection

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

    // Get package ID
    const commandID = await sqlStorage`
      SELECT pointer FROM names
      WHERE name = ${packageName};
    `;

    if (commandID.count === 0) {
      throw new Error(`Package ${packageName} not found!`);
    }

    let pointer = commandID[0].pointer;

    // Now to get the current badge data for this package.
    const commandPack = await sqlStorage`
      SELECT * FROM packages
      WHERE pointer = ${pointer};
    `;

    if (commandPack.count === 0) {
      throw new Error(`Unable to get Data field of ${pointer}:${packageName}`);
    }

    let pckData = commandPack[0].data;

    if (!Array.isArray(pckData.badges)) {
      pckData.badges = [];
    }

    pckData.badges.push(badgeConfig);

    // Now to update the package itself
    const updatePack = await sqlStorage`
      UPDATE packages
      SET data = ${pckData}
      WHERE pointer = ${pointer}
      RETURNING name;
    `;

    if (updatePack.count === 0) {
      throw new Error(`Unable to update package: ${packageName}`);
    }

    // We have successfully update the package.
    await sqlStorage.end();
    console.log(`Successfully added the badge to ${packageName}`);
    process.exit(0);
  } catch (err) {
    console.error("An error occured!");
    if (sqlStorage !== undefined) {
      await sqlStorage.end();
      console.log("SQL Server Disconnected!");
    }
    console.error(err);
    process.exit(100);
  }
}

main();

const fs = require("fs");
const postgres = require("postgres");
const parseGithubUrl = require("parse-github-url");
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } =
  require("../../src/config.js").getConfig();

let sqlStorage;

const LIMIT = parseInt(process.env.LIMIT ?? "-1", 10);
const OFFSET = parseInt(process.env.OFFSET ?? "0", 10);
const VERBOSE = (process.env.VERBOSE ?? "0") !== "0";

function log(...args) {
  if (!VERBOSE) return;
  return console.log(...args);
}

function debug(...args) {
  if (!VERBOSE) return;
  return console.debug(...args);
}

function warn(...args) {
  if (!VERBOSE) return;
  return console.warn(...args);
}

async function init() {
  let allPointers = await getPointers();
  let totalPointers = allPointers.length;
  log("Package count:", totalPointers);

  for (let { name, pointer } of allPointers) {
    log(`Checking: ${name}::${pointer}`);

    if (typeof name !== "string") {
      console.error(
        `The package ${name}::${pointer} is invalid without its name!`
      );
      continue;
    }
    if (typeof pointer !== "string") {
      console.error(`The package ${name}::${pointer} likely has been deleted.`);
      continue;
    }

    let { ok, content: pack } = await getPackageData(pointer);
    if (!ok) {
      warn(`Error getting package ${name}!`);
      continue;
    }

    let meta = pack?.data;
    let repositoryUrl = meta?.repository.url;
    if (!repositoryUrl) {
      console.error(`No repository URL found for package ${name}!`);
      continue;
    }

    let parsed = parseGithubUrl(repositoryUrl);
    if (parsed === null) {
      console.error(
        `Could not parse repo URL for package: ${name}: ${repositoryUrl}`
      );
      continue;
    }

    let { owner } = parsed;
    if (pack.owner === owner) {
      debug(`Package ${name} already has the right owner!`);
      continue;
    }

    log("Updating owner field of package:", name);
    await sqlStorage`
      UPDATE packages SET owner = ${owner} WHERE pointer = ${pointer};
    `;
  }

  await sqlEnd();
  process.exit(0);
}

async function getPointers() {
  sqlStorage ??= setupSQL();

  let command;

  if (LIMIT > 0) {
    command = await sqlStorage`
      SELECT * FROM names LIMIT ${LIMIT} OFFSET ${OFFSET};
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
  console.log("getting package data:", pointer);

  try {
    sqlStorage ??= setupSQL();
    const command = await sqlStorage`
      SELECT * from packages
      WHERE pointer = ${pointer}
    `;

    if (command.count === 0) {
      return { ok: false, content: `Failed to get package data of ${pointer}` };
    }

    return { ok: true, content: command[0] };
  } catch (err) {
    console.error(`ERROR!`);
    console.error(err);
  }
}

function setupSQL() {
  try {
    let options = {
      host: DB_HOST,
      username: DB_USER,
      password: DB_PASS,
      database: DB_DB,
      port: DB_PORT,
    };
    if (DB_SSL_CERT) {
      options.ssl = {
        rejectUnauthorized: true,
        ca: fs.readFileSync(DB_SSL_CERT).toString(),
      };
    }
    sqlStorage = postgres(options);

    return sqlStorage;
  } catch (err) {
    console.error(err);
    process.exit(100);
  }
}

async function sqlEnd() {
  if (sqlStorage !== undefined) {
    await sqlStorage.end();
    console.log("Task done!");
  }
  return;
}

module.exports = init;

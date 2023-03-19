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
  * packageMetadata : Runs this health check.
  * versionTagExists : Runs this health check.
  * latestVersionIsAssigned: Runs this health check.

Health Checks:
  * versionTagExists: Checks that the tarball of a packages version is available on GitHub.
  * packageMetadata: Checks that the `data` field of a package is valid.
  * latestVersionIsAssigned: Checks that the latest version showing on the package's `data`
                              field is the latest on the DB.

Notes:
  - This script does rely on `./src/config.js` to collect db connection configuration
*/

const fs = require("fs");
const postgres = require("postgres");
const superagent = require("superagent");
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } = require("../../src/config.js").getConfig();

let sqlStorage;

let lastGithubContact = 0; // Measured in epoch date
let waitingOnGithubBuffer = false;

let config = {
  read: true,
  saveJSON: false,
  verbose: false,
  useLimit: false,
  limit: 0,
  loading: 'dots',
  githubContactBuffer: 10000, // The milliseconds to wait before contacting GitHub again.
  packageMetadata: false,
  versionTagExists: false,
  latestVersionIsAssigned: false,
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
    if (param === "versionTagExists") {
      config.versionTagExists = true;
    }
    if (param === "latestVersionIsAssigned") {
      config.latestVersionIsAssigned = true;
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
    if (config.verbose) {
      console.log(`Checking: ${pointer.name}::${pointer.pointer}`);
    } else {
      // Since this can be a long running task, we will output a loading bar.
      if (config.loading === "dots") {
        process.stdout.write(".");
      }
    }

    if (typeof pointer.name !== "string") {
      results.push(`The package ${pointer.name}::${pointer.pointer} is invalid without it's name!`);
      continue;
    }
    if (typeof pointer.pointer !== "string") {
      results.push(`The package ${pointer.name}::${pointer.pointer} likely has been deleted.`);
      continue;
    }

    if (config.packageMetadata) {

      let tmp = await validatePackageMetadata(pointer);

      if (typeof tmp === "string") {
        results.push(tmp);
      }
    }

    if (config.versionTagExists) {

      let tmp = await versionTagExists(pointer);

      if (typeof tmp === "string") {
        results.push(tmp);
      }
    }

    if (config.latestVersionIsAssigned) {
      let tmp = await latestVersionIsAssigned(pointer);

      if (typeof tmp === "string") {
        results.push(tmp);
      }
    }

  }

  // Now to log the results
  console.log("\n"); // Newline to ensure the loading doesn't appear
  if (results.length > 0) {
    for (const res of results) {
      console.log(res);
    }

    if (config.saveJSON) {
      fs.writeFileSync("./health-check-output.json", JSON.stringify(results, null, 2));
    }
  } else {
    console.log("Everything here is healthy!");
  }

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

async function getVersions(pointer) {
  sqlStorage ??= setupSQL();

  const command = await sqlStorage`
    SELECT * from versions
    WHERE package = ${pointer}
  `;

  if (command.count === 0) {
    return { ok: false, content: `Failed to get version data of ${pointer}` };
  }

  return { ok: true, content: command };
}

async function getLatestVersion(pointer) {
  sqlStorage ??= setupSQL();

  const command = await sqlStorage`
    SELECT * FROM versions
    WHERE package = ${pointer} AND status = 'latest'
  `;

  if (command.count === 0) {
    return { ok: false, content: `Failed to get latest version data of ${pointer}` };
  }

  return { ok: true, content: command };
}

async function contactGitHub(url) {
  const acceptableStatusCodes = [ 200, 404 ];
  return new Promise(async (resolve, reject) => {
    const now = Date.now();

    if (config.verbose) {
      console.log(`Now: ${now} - Last Contact: ${lastGithubContact} - Buffer: ${config.githubContactBuffer}`);
      console.log(`Can contact: ${now - lastGithubContact > config.githubContactBuffer}`);
    }

    if (now - lastGithubContact > config.githubContactBuffer) {
      // lets contact github
      lastGithubContact = now;
      waitingOnGithubBuffer = false;

      try {
        const res = await superagent
          .get(url)
          .set({
            "User-Agent": "Pulsar-Edit Health Check Bot"
          })
          .ok((res) => acceptableStatusCodes.includes(res.status));

        resolve(res);

      } catch(err) {
        reject(err);
      }

    } else {
      // we have to wait our full timeout
      setTimeout(() => {
        resolve(contactGitHub(url));
      }, config.githubContactBuffer);
      waitingOnGithubBuffer = true;
      twirlTimer(waitingOnGithubBuffer);
    }
  });
}

function twirlTimer(control) {
  console.log("\n");
  const icon = [ "\\", "|", "/", "-" ];
  let x = 0;
  setInterval(() => {
    if (control) {
      process.stdout.write("\r" + icon[x++] + " Waiting on GitHub API Buffer");
      x &= 3;
    }
  }, 250);
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

async function versionTagExists(pointer) {
  let versions = await getVersions(pointer.pointer);

  if (!versions.ok) {
    return versions.content;
  }

  for (const ver of versions.content) {
    if (typeof ver?.meta?.tarball_url !== "string") {
      return `The package ${pointer.name}::${pointer.pointer}@${ver.semver} Has no valid tarball_url!`;
    }

    let gitData = await contactGitHub(ver.meta.tarball_url);

    if (gitData.status === 404) {
      return `The package ${pointer.name}::${pointer.pointer}@${ver.semver} does not exist on GitHub!`;
    }

    if (gitData.status !== 200) {
      console.log(gitData);
      console.log(`The above applies to the package ${pointer.name}::${pointer.pointer}@${ver.semver}`);
      return `Got ${gitData.status} from GitHub on package ${pointer.name}::${pointer.pointer}@${ver.semver}`;
    }

    return false;
  }

}

async function latestVersionIsAssigned(pointer) {
  let package = await getPackageData(pointer.pointer);
  let version = await getLatestVersion(pointer.pointer);

  if (!package.ok) {
    return package.content;
  }
  if (!version.ok) {
    return version.content;
  }

  if (package.content?.metadata?.version !== version.content?.semver) {
    return `The package ${pointer.name}::${pointer.pointer} has ${package.content?.metadata?.version} as the latest when it's really ${version.content?.semver}!`;
  }

  return false;
}

init(process.argv.slice(2));

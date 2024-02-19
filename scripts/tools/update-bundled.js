// This script will update the bundled package information from remote repositories

const path = require("path");
const cp = require("child_process");
const fs = require("fs");
const util = require("node:util");

const exec = util.promisify(cp.exec);

const BUNDLED = {};

const REPOS = [
  {
    name: "pulsar",
    url: "https://github.com/pulsar-edit/pulsar",
    isPulsar: true
  },
  {
    name: "snippets",
    url: "https://github.com/pulsar-edit/snippets",
    isPulsar: false
  },
  {
    name: "github",
    url: "https://github.com/pulsar-edit/github",
    isPulsar: false
  }
];

(async () => {

  // First lets clone the repos

  for (let i = 0; i < REPOS.length; i++) {
    let REPO = REPOS[i];

    if (REPO.isPulsar) {
      // This is the Pulsar repo and gets special handling

      await cloneRepo(REPO.url, path.join("bundled-repos", REPO.name));

      scanPulsarPackages();

    } else {
      // Any other single package repo

      await cloneRepo(REPO.url, path.join("bundled-repos", REPO.name));

      findDetails(path.resolve(process.cwd(), path.join("bundled-repos", REPO.name)));
    }
  }

  // Now lets save the file
  fs.writeFileSync(
    path.resolve(process.cwd(), path.join("src", "bundled_packages", "bundled.json")),
    JSON.stringify(BUNDLED, null, 2),
    { encoding: "utf8" }
  );
  console.log("Saved new Bundled Info");

})();


async function cloneRepo(repoName, filePath) {

  try {
    console.log(`Handling '${repoName}'...`);

    const { stdout, stderr } = await exec(`git clone ${repoName} ${filePath}`);

    console.log("stdout: ", stdout);
    console.log("stderr: ", stderr);

  } catch(err) {
    console.error(err);
  }
  return;
}

function scanPulsarPackages() {
  const packsPath = path.resolve(process.cwd(), path.join("bundled-repos", "pulsar", "packages"));
  const dirs = fs.readdirSync(packsPath);

  for (const dir of dirs) {
    const packPath = path.join(packsPath, dir);

    if (fs.lstatSync(packPath).isFile()) {
      // we found a file here and we want to ignore
      continue;
    }

    findDetails(packPath);
  }

}

function findDetails(packPath) {
  // Reads the data from disk, adding it to the top level bundled package object
  const readme = fs.readFileSync(path.join(packPath, "README.md"), { encoding: "utf8" });
  const packJson = JSON.parse(fs.readFileSync(path.join(packPath, "package.json"), { encoding: "utf8" }));

  BUNDLED[packJson.name] = {
    readme: readme,
    metadata: packJson
    // While technically this could make the file larger, it's worth making sure we
    // get all current and future important details
  };

}

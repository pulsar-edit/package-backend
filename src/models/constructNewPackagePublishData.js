/**
 * @function constructNewPackagePublishData
 * @desc Takes the multiple different sets of data from VCS.newPackageData()
 * and constructs an object that can then be used for publication.
 * This superseeds the `PackageObject` object builder, which attempted to be too
 * generic for it's own good.
 */
const parseGithubURL = require("parse-github-url");
const semver = require("semver");

module.exports = function constructNewPackagePublishData(opts = {}) {
  // `opts` Contains:
  // ownerRepo = OWNER/REPO (string)
  // provider = Provider object from VCS
  // packageJson = The full `package.json` from the latest version
  // tag = The GitHub API return of tag information
  // readme = The full text readme

  let out = {};

  // Lets first apply some defaults, not really needed on new packages, but kept
  // for backwards compatibility with tests
  out.creation_method = "User Made Package";
  out.downloads = "0";
  out.stargazers_count = "0";
  out.badges = [];

  opts.parsedUrl = parseGithubURL(opts.ownerRepo);

  if (typeof opts.packageJson.repository === "string") {
    opts.parsedRepo = parseGithubURL(opts.packageJson.repository);
  } else if (
    typeof opts.packageJson.repository === "object" &&
    typeof opts.packageJson.repository.url === "string"
  ) {
    // Support repository objects in `package.json`
    opts.parsedRepo = parseGithubURL(opts.packageJson.repository.url);
  }

  // Now lets setup some constants that we will use over and over
  let PACK_NAME = findPackName(opts);
  let PACKAGE_VER = findLatestVer(opts);

  out.name = PACK_NAME;
  out.owner = findOwner(opts);
  out.readme = typeof opts.readme === "string" ? opts.readme : "";
  out.repository = opts.provider;
  out.metadata = buildMeta(opts);
  out.releases = {
    latest: PACKAGE_VER,
  };

  // From here we want to build or version objects, except we don't have the
  // `package.json` info for anything except our latest version. Which means
  // we can't build it out the same way we do for others. This means we will only
  // build out fully the latest version, and make stubbed mandatory-only entries
  // for the rest.

  out.versions = {};
  // So lets loop through all versions, we will use the same meta object for the
  // latest, while getting mandatory only fields for the rest
  out.versions[PACKAGE_VER] = buildMeta(opts);
  buildAbsentVer(PACKAGE_VER, opts)
  // Now we should be good to go

  return out;
};

function throwIfFalse(value, id, func) {
  if (typeof value === "boolean" && !false) {
    if (typeof func === "function") {
      // Support callback to a custom function for generating the error output
      func();
    } else {
      throw new Error(`The value '${id}' couldn't be found!`);
    }
  }
}

function findPackName(opts) {
  let name = false;

  // Prefer getting the name from the actual package.
  // Since the repo name might not match the package name.
  if (typeof opts.packageJson?.name === "string") {
    // Find name as normally declared on the `package.json`
    name = opts.packageJson.name;
  } else if (typeof opts.parsedUrl?.name === "string") {
    // Find name via the parsed `ownerRepo` provided for publication
    name = opts.parsedUrl.name;
  } else if (typeof opts.parsedRepo?.name === "string") {
    // Fallback to the repository of the `package.json` which shouldn't be needed
    name = opts.parsedRepo.name;
  }

  throwIfFalse(name, "package name");
  return name;
}

function findOwner(opts) {
  let owner = false;

  // Like findPackName we will prefer finding this info in the package
  if (typeof opts.parsedRepo?.owner === "string") {
    // Find owner via the normally declared `repository` entry of the `package.json`
    owner = opts.parsedRepo.owner;
  } else if (opts.parsedUrl?.owner === "string") {
    // Find owner via the parsed URL for publication
    owner = opts.parsedUrl.owner;
  } else if (typeof opts.packageJson.author === "string") {
    // The above shouldn't fail, if it does, we can look at a simple owner entry
    // on the `package.json`. This doesn't account for non-string entries
    owner = opts.packageJson.author;
  }

  throwIfFalse(owner, "owner");
  return owner;
}

function findLatestVer(opts) {
  let latest = false;

  // We will assume the latest version is always whats present and defined
  // within the `package.json`
  if (typeof opts.packageJson.version === "string") {
    latest = semver.clean(opts.packageJson.version);
  }

  throwIfFalse(latest, "latest version");
  return latest;
}

function buildMeta(opts) {
  // This function builds the metadata object for a package publication, which
  // consists of:
  //  - the latests `package.json` in full
  //  - an engines declaration
  //  - a `dist` object pointing to the latest version within the tags

  let sha = false;
  let tarball = false;
  let ver = findLatestVer(opts);
  let out = {};

  out = opts.packageJson;

  if (!out.engines) {
    out.engines = { atom: "*" };
  }

  let tag = opts.tag;

  sha = tag.commit.sha ?? false;
  tarball = tag.tarball_url ?? false;

  out.dist = {
    sha: sha,
    tarball: tarball,
  };

  // Then lets validate these required fields
  throwIfFalse(sha, "", () => {
    throw new Error(`Unable to locate the SHA for version: '${ver}'!`);
  });
  throwIfFalse(tarball, "", () => {
    throw new Error(`Unable to locate the Tarball URL for version: '${ver}'!`);
  });

  return out;
}

function buildAbsentVer(ver, opts) {
  // Here we will build an "absent" version object. Since we don't have the
  // `package.json` of this version, it's considered absent, and will only receive
  // the mandatory fields we can discover via the current version, and it's tag
  let tag = opts.tag;

  let sha = false;
  let tarball = false;
  let out = {};

  sha = tag.commit.sha ?? false;
  tarball = tag.tarball_url ?? false;

  out.name = opts.packageJson.name;
  out.license = opts.packageJson.license ?? "NONE";
  out.version = ver;
  out.description = opts.packageJson.description ?? "NONE";
  out.repository = opts.packageJson.repository; // TODO have more flexibility here
  out.dist = {
    sha: sha,
    tarball: tarball,
  };

  if (typeof opts.packageJson.theme === "string") {
    out.theme = opts.packageJson.theme;
  }

  // Lets validate
  throwIfFalse(sha, "", () => {
    throw new Error(`Unable to locate the SHA for version: '${ver}'!`);
  });
  throwIfFalse(tarball, "", () => {
    throw new Error(`Unable to locate the Tarball URL for version: '${ver}'!`);
  });

  return out;
}

// This module functions as a package builder.
// Allowing tests to cut down on verbosity when creating test packages
// to insert into the DB.
// Additionally, confining package data creation to a single location
// ensures better ease of changes to this data format.

const gh = require("parse-github-url");

// TODO: Use the package builder, or follow suite of `normalize-package-data`
// and migrate away from an object builder for package data at all.

// repo = The imaginary URL of the package, eg. 'https://github.com/pulsar-edit/pulsar'
// opts:
//  * versions: An array of different versions, optional.
//  * extraVersionData: An object that should be added to every single version
module.exports =
function genPackage(repo, opts = {}) {
  let pack = {};

  // Repo Info
  let parsedGH = gh(repo);

  pack.name = parsedGH.name;
  pack.repository = {
    url: repo,
    type: "git" // TODO stop hardcoding git
  };
  pack.owner = parsedGH.owner;

  // Static Info
  pack.creation_method = "Test Package";
  pack.readme = "This is a readme!";
  pack.versions = {};
  pack.releases = {};

  // Construct version info
  let versionInfo = {
    name: pack.name,
    dist: {
      tarball: "download-url",
      sha: "1234"
    }
  };

  if (opts.extraVersionData) {
    versionInfo = { ...versionInfo, ...opts.extraVersionData };
  }

  if (opts.versions) {
    pack.releases.latest = opts.versions[0];

    for (let i = 0; i < opts.versions.length; i++) {
      pack.versions[opts.versions[i]] = versionInfo;
    }
  } else {
    // No custom version data defined, default to a single version
    pack.releases.latest = "1.0.0";

    pack.versions["1.0.0"] = versionInfo;
  }

  // Construct Metadata
  let metadata = {
    name: pack.name
  };

  if (opts.extraVersionData) {
    metadata = { ...metadata, ...opts.extraVersionData };
  }

  pack.metadata = metadata;

  return pack;
}

/**
Example Usage:
let package = genPackage("https://github.com/pulsar-edit/pulsar");
console.log(package);
{
  name: "pulsar",
  repository: {
    url: "https://github.com/pulsar-edit/pulsar",
    type: "git"
  },
  owner: "pulsar-edit",
  creation_method: "Test Package",
  readme: "This is a readme!",
  releases: {
    latest: "1.0.0"
  },
  metadata: {
    name: "pulsar"
  },
  versions: {
    "1.0.0": {
      name: "pulsar",
      dist: {
        tarball: "download-url",
        sha: "1234"
      }
    }
  }
}
*/

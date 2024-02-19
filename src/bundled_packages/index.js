/**
 * @desc This module helps interact with bundled packages. That is packages that
 * don't actually exist on the database, but are included with Pulsar by default.
 */
const BUNDLED_PACKAGES = require("./bundled.json");

module.exports = {
  // Used to check if a specific name belongs to a bundled package
  isNameBundled: (name) => {
    if (BUNDLED_PACKAGES[name]) {
      return { ok: true, content: true };
    } else {
      return { ok: true, content: false };
    }
  },

  // Used to retreive details about a bundled package
  getBundledPackage: (name) => {
    let pack = BUNDLED_PACKAGES[name];

    if (!pack) {
      return {
        ok: false,
        content: `Failed to get bundled package details: '${name}'.`,
        short: "server_error",
      };
    }

    return { ok: true, content: buildPackage(pack) };
  },
};

const DEFAULT_PACK = {
  name: "",
  readme: "",
  owner: "pulsar-edit",
  metadata: {
    dist: {
      // We don't support installation of these packages, but don't want to cause any errors
      sha: "",
      tarball: "",
    },
    name: "",
    engines: {
      atom: "*",
    },
    license: "MIT",
    version: "",
    repository: "https://github.com/pulsar-edit/pulsar",
    description: "",
  },
  releases: {
    latest: "",
  },
  versions: {}, // We exclude version information as we don't actually support installation
  repository: {
    url: "https://github.com/pulsar-edit/pulsar",
    type: "git",
  },
  creation_method: "Bundled Package",
  downloads: "0",
  stargazers_count: "0",
  is_bundled: true,
  badges: [
    {
      title: "Bundled",
      type: "info",
      link: "https://github.com/pulsar-edit/package-backend/blob/main/docs/reference/badge_spec.md#bundled",
    },
  ],
};

// Util function to combine the 'DEFAULT_PACK' with the data provided for this
// particular package
function buildPackage(pack) {
  let newPack = Object.assign(DEFAULT_PACK, pack);

  // Now we want to replace specific sets of data
  newPack.name = pack.metadata.name;
  newPack.releases.latest = pack.metadata.version;

  // Now we move to optional data
  if (pack.metadata.repository) {
    newPack.repository.url = pack.metadata.repository;
  }

  return newPack;
}

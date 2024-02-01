/**
 * @desc This module helps interact with bundled packages. That is packages that
 * don't actually exist on the database, but are included with Pulsar by default.
 */

module.exports = {
  // Used to check if a specific name belongs to a bundled package
  isNameBundled: (name) => {
    if (BUNDLED_PACKAGES.includes(name)) {
      return true;
    } else {
      return false;
    }
  },

  // Used to retreive details about a bundled package
  getBundledPackage: (name) => {
    if (!this.isNameBundled(name)) {
      return { ok: false, content: `Failed to find assumed bundled package: '${name}'.`, short: "not_found" };
    }

    let pack = require(`./${name}.json`);

    if (!pack) {
      return { ok: false, content: `Failed to retreive details of bundled package: '${name}'.`, short: "server_error" };
    }

    return { ok: true, content: buildPackage(pack) };
  },

  BUNDLED_PACKAGES: BUNDLED_PACKAGES
};

const BUNDLED_PACKAGES = [
  "about",
  "archive-view",
  "atom-dark-syntax",
  "atom-dark-ui",
  "atom-light-syntax",
  "atom-light-ui",
  "autocomplete-atom-api",
  "autocomplete-css",
  "autocomplete-html",
  "autocomplete-plus",
  "autocomplete-snippets",
  "autoflow",
  "autosave",
  "background-tips",
  "base16-tomorrow-dark-theme",
  "base16-tomorrow-light-theme",
  "bookmarks",
  "bracket-matcher",
  "command-palette",
  "dalek",
  "deprecation-cop",
  "dev-live-reload",
  "encoding-selector",
  "exception-reporting",
  "find-and-replace",
  "fuzzy-finder",
  "git-diff",
  "go-to-line",
  "grammar-selector",
  "image-view",
  "incompatible-packages",
  "keybinding-resolver",
  "language-c",
  "language-clojure",
  "language-coffee-script",
  "language-csharp",
  "language-css",
  "language-gfm",
  "language-git",
  "language-go",
  "language-html",
  "language-hyperlink",
  "language-java",
  "language-javascript",
  "language-json",
  "language-less",
  "language-make",
  "language-mustache",
  "language-objective-c",
  "language-perl",
  "language-php",
  "language-property-list",
  "language-python",
  "language-ruby-on-rails",
  "language-ruby",
  "language-rust-bundled",
  "language-sass",
  "language-shellscript",
  "language-source",
  "language-sql",
  "language-text",
  "language-todo",
  "language-toml",
  "language-typescript",
  "language-xml",
  "language-yaml",
  "line-ending-selector",
  "link",
  "markdown-preview",
  "notifications",
  "one-dark-syntax",
  "one-dark-ui",
  "one-light-syntax",
  "one-light-ui",
  "open-on-github",
  "package-generator",
  "pulsar-updater",
  "settings-view",
  "solarized-dark-syntax",
  "solarized-light-syntax",
  "spell-check",
  "status-bar",
  "styleguide",
  "symbol-provider-ctags",
  "symbol-provider-tree-sitter",
  "symbols-view",
  "tabs",
  "timecop",
  "tree-view",
  "update-package-dependencies",
  "welcome",
  "whitespace",
  "wrap-guide"
];

const DEFAULT_PACK = {
  name: "",
  readme: "",
  owner: "pulsar-edit",
  metadata: {
    dist: { // We don't support installation of these packages, but don't want to cause any errors 
      sha: "",
      tarball: ""
    },
    name: "",
    engines: {
      atom: "*"
    },
    license: "MIT",
    version: "",
    repository: "https://github.com/pulsar-edit/pulsar",
    description: ""
  },
  releases: {
    latest: ""
  },
  versions: {}, // We exclude version information as we don't actually support installation
  repository: {
    url: "https://github.com/pulsar-edit/pulsar",
    type: "git"
  },
  creation_method: "Bundled Package",
  downloads: "",
  stargazers_count: "",
  badges: [
    {
      title: "Bundled",
      type: "info",
      link: "https://github.com/pulsar-edit/package-backend/blob/main/docs/reference/badge_spec.md#bundled"
    }
  ]
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

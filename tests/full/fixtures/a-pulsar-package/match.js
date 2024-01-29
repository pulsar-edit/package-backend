module.exports = {
  name: "a-pulsar-package",
  owner: "confused-Techie",
  readme: expect.stringContaining("I'm a readme!"),
  metadata: {
    dist: {
      sha: "09f",
      tarball: "https://api.github.com/repos/confused-Techie/a-pulsar-package/tarball/refs/tags/v1.0.0"
    },
    main: "./lib/main.js",
    name: "a-pulsar-package",
    engines: { atom: "*" },
    license: "MIT",
    version: "1.0.0",
    repository: "https://github.com/confused-Techie/a-pulsar-package",
    description: "A package for stuff."
  },
  releases: { latest: "1.0.0" },
  versions: {
    "1.0.0": {
      dist: {
        tarball: "https://api.pulsar-edit.dev/api/packages/a-pulsar-package/versions/1.0.0/tarball"
      },
      main: "./lib/main.js",
      name: "a-pulsar-package",
      license: "MIT",
      version: "1.0.0",
      repository: "https://github.com/confused-Techie/a-pulsar-package",
      description: "A package for stuff."
    }
  },
  repository: {
    url: "https://github.com/confused-Techie/a-pulsar-package",
    type: "git"
  },
  creation_method: "User Made Package",
  downloads: "0",
  stargazers_count: "0",
  badges: [ { title: "Made for Pulsar!", type: "success" } ]
};

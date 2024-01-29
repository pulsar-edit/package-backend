module.exports = {
  name: "b-pulsar-package",
  owner: "confused-Techie",
  readme: expect.stringContaining("I'm a readme!"),
  metadata: {
    dist: {
      sha: "09f",
      tarball: "https://api.github.com/repos/confused-Techie/b-pulsar-package/tarball/refs/tags/v2.0.0"
    },
    main: "./lib/main.js",
    name: "b-pulsar-package",
    engines: { atom: "*" },
    license: "MIT",
    version: "2.0.0",
    repository: "https://github.com/confused-Techie/b-pulsar-package",
    description: "A package for stuff."
  },
  releases: { latest: "2.0.0" },
  versions: {
    "2.0.0": {
      dist: {
        tarball: expect.stringContaining("api/packages/b-pulsar-package/versions/2.0.0/tarball")
      },
      main: "./lib/main.js",
      name: "b-pulsar-package",
      license: "MIT",
      version: "2.0.0",
      repository: "https://github.com/confused-Techie/b-pulsar-package",
      description: "A package for stuff."
    },
    "1.0.0": {
      dist: {
        tarball: expect.stringContaining("api/packages/b-pulsar-package/versions/1.0.0/tarball")
      },
      //main: "./lib/main.js",
      // Since building the package.json of v1.0.0 is an absent build, we
      // can't expect it to know what the 'main' entry may have been
      name: "b-pulsar-package",
      license: "MIT",
      version: "1.0.0",
      repository: "https://github.com/confused-Techie/b-pulsar-package",
      description: "A package for stuff."
    }
  },
  repository: {
    url: "https://github.com/confused-Techie/b-pulsar-package",
    type: "git"
  },
  creation_method: "User Made Package",
  downloads: "0",
  stargazers_count: "0",
  badges: [ { title: "Made for Pulsar!", type: "success" } ]
};

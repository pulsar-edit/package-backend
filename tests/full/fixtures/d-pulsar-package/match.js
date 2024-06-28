module.exports = {
  name: "d-pulsar-package",
  owner: "confused-Techie",
  readme: expect.stringContaining("I'm a readme!"),
  metadata: {
    main: "./lib/main.js",
    name: "d-pulsar-package",
    engines: { atom: "*" },
    license: "MIT",
    version: "2.0.0",
    repository: "https://github.com/confused-Techie/d-pulsar-package",
    description: "An old package for stuff",
  },
  releases: { latest: "2.0.0" },
  versions: {
    "2.0.0": {
      dist: {
        tarball: expect.stringContaining(
          "/api/packages/d-pulsar-package/versions/2.0.0/tarball"
        ),
      },
      main: "./lib/main.js",
      name: "d-pulsar-package",
      license: "MIT",
      version: "2.0.0",
      repository: "https://github.com/confused-Techie/d-pulsar-package",
      description: "An old package for stuff",
    },
    "1.0.0": {
      dist: {
        tarball: expect.stringContaining(
          "/api/packages/d-pulsar-package/versions/1.0.0/tarball"
        ),
      },
      main: "./lib/main.js",
      name: "d-pulsar-package",
      license: "MIT",
      version: "1.0.0",
      repository: "https://github.com/confused-Techie/d-pulsar-package",
      description: "A new package for stuff",
    },
  },
  repository: {
    url: "https://github.com/confused-Techie/d-pulsar-package",
    type: "git",
  },
  downloads: "0",
  stargazers_count: "0",
  badges: [{ title: "Made for Pulsar!", type: "success" }],
};

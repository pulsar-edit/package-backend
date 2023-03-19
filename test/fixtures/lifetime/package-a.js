const createPack = {
  name: "package-a-lifetime",
  repository: {
    type: "git",
    url: "https://github.com/pulsar-edit/package-a-lifetime",
  },
  creation_method: "Test Package",
  readme: "This is a readme!",
  metadata: {
    name: "package-a-lifetime",
    license: "MIT",
    version: "1.0.0",
  },
  releases: {
    latest: "1.0.0",
  },
  versions: {
    "1.0.0": {
      name: "package-a-lifetime",
      version: "1.0.0",
      tarball_url: "https://nowhere.com",
      sha: "12345",
    },
  },
};

const addVersion = (v) => {
  return {
    name: "package-a-lifetime",
    version: v,
    description: "A package.json description",
    license: "MIT",
    engines: { atom: "*" },
  };
};

const packageDataForVersion = (v) => {
  return {
    name: "package-a-lifetime",
    repository: {
      type: "git",
      url: "https://github.com/pulsar-edit/package-a-lifetime",
    },
    readme: "This is a readme!",
    metadata: v,
  };
};

module.exports = {
  createPack,
  addVersion,
  packageDataForVersion,
};

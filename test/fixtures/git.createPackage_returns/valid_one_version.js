module.exports = {
  name: "publish-test-valid",
  repository: {
    type: "git",
    url: "https://github.com/pulsar-edit/test",
  },
  creation_method: "Test Package",
  readme: "This is a readme!",
  metadata: {
    name: "publish-test-valid",
    license: "MIT",
    version: "1.0.0",
  },
  releases: {
    latest: "1.0.0",
  },
  versions: {
    "1.0.0": {
      name: "publish-test-valid",
      version: "1.0.0",
      tarball_url: "https://nowhere.com",
      sha: "12345",
    },
  },
};

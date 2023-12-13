module.exports = {
  name: "publish-test-valid-multi-version",
  repository: {
    type: "git",
    url: "https://github.com/pulsar-edit/test",
  },
  creation_method: "Test Package",
  readme: "This is a readme!",
  metadata: {
    name: "publish-test-valid-multi-version",
    license: "MIT",
    version: "1.0.3",
  },
  releases: {
    latest: "1.0.3",
  },
  versions: {
    "1.0.0": {
      name: "publish-test-valid-multi-version",
      version: "1.0.0",
      tarball_url: "https://nowhere.com",
      sha: "12345",
    },
    "1.0.1": {
      name: "publish-test-valid-multi-version",
      version: "1.0.1",
      tarball_url: "https://nowhere.com",
      sha: "12345",
    },
    "1.0.2": {
      name: "publish-test-valid-multi-version",
      version: "1.0.2",
      tarball_url: "https://nowhere.com",
      sha: "12344",
    },
    "1.0.3": {
      name: "publish-test-valid-multi-version",
      version: "1.0.3",
      tarball_url: "https://nowhere.com",
      sha: "12345",
    },
  },
};

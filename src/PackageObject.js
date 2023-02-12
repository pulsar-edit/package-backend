/**
 * @module PackageObject
 * @desc
 */

class PackageObject {
  constructor() {
    this.Version = new Version();
    this.name = undefined;
    this.ownerRepo = undefined;
    this.repository = {
      type: undefined,
      url: undefined
    };
    this.downloads = undefined;
    this.stargazers_count = undefined;
    this.readme = undefined;
    this.packJSON = undefined;
  }

  setName(value) {
    this.name = value;
    return this;
  }

  setOwnerRepo(value) {
    this.ownerRepo = value;
    return this;
  }

  setDownloads(value) {
    this.downloads = value;
    return this;
  }

  setStargazers(value) {
    this.stargazers_count = value;
    return this;
  }

  setReadme(value) {
    this.readme = value;
    return this;
  }

  setRepository(value) {
    this.repository = value;
    return this;
  }

  setRepositoryType(value) {
    this.repository.type = value;
    return this;
  }

  setRepositoryURL(value) {
    this.repository.url = value;
    return this;
  }

  parse(pack) {
    // Parse can take a packages data and destructure accordingly

    this.name = pack.name ?? this.name;
  }

  buildShort() {

  }

  buildFull() {

  }

}

class Version {
  constructor() {
    this.latest = undefined;
  }

  addVersion(value) {

  }

  addVersions(values) {
    for (const value in values) {
      this.addVersion(value);
    }
    return this;
  }

}

module.exports = PackageObject;

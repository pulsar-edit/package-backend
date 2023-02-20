/**
 * @module PackageObject
 * @desc
 */

const logger = require("./logger.js");
const utils = require("./utils.js");

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
    this.creationMethod = undefined;
  }

  setName(packNameString) {
    if (typeof packNameString !== "string") {
      logger.generic(3, `PackageObject.setName() called wtih ${packNameString}::${typeof packNameString}. Ignoring assignment.`);
      return this;
    }

    this.name = packNameString;
    return this;
  }

  setOwnerRepo(ownerRepoString) {
    if (typeof ownerRepoString !== "string") {
      logger.generic(3, `PackageObject.setOwnerRepo() called with ${ownerRepoString}::${typeof ownerRepoString}. Ignoring assignment.`);
      return this;
    }

    let testValidation = ownerRepoString.split("/");

    if (testValidation.length !== 2) {
      // If the name is longer than 2, then it is not owner/repo
      logger.generic(3, `PackageObject.setOwnerRepo() called with invalid split length value ${ownerRepoString}. Ignoring assignment.`);
      return this;
    }

    this.ownerRepo = ownerRepoString;
    return this;
  }

  setDownloads(downloadCount) {
    if (Number.isNaN(parseInt(downloadCount))) {
      logger.generic(3, `PackageObject.setDownloads() called with invalid argument ${downloadCount}. Ignoring assignment.`);
      return this;
    }

    this.downloads = downloadCount;
    return this;
  }

  setStargazers(stagazerCount) {
    if (Number.isNaN(parseInt(stargazerCount))) {
      logger.generic(3, `PackageObject.setStargazers() called with invalid argument ${stagazerCount}. Ignoring assignment.`);
      return this;
    }

    this.stargazers_count = stargazerCount;
    return this;
  }

  setReadme(readmeString) {
    if (typeof readmeString !== "string") {
      logger.generic(3, `PackageObject.setReadme() called with invalid argument type ${readmeString}::${typeof readmeString}. Ignoring assignment.`);
      return this;
    }

    this.readme = readmeString;
    return this;
  }

  setRepository(repoObject) {
    if (!repoObject.type || !repoObject.url) {
      logger.generic(3, `PackageObject.setRepository() called with invalid object ${repoObject}. Ignoring assignment.`);
      return this;
    }

    this.repository.type = repoObject.type;
    this.repository.url = repoObject.url;
    return this;
  }

  setRepositoryType(repoType) {
    this.repository.type = repoType;
    return this;
  }

  setRepositoryURL(repoURL) {
    this.repository.url = repoURL;
    return this;
  }

  setCreationMethod(method) {
    this.creationMethod = method;
    return this;
  }

  parse(pack) {
    // Parse can take a packages data and destructure accordingly
    throw new Error("Not Implemented! ~ PackageObject.parse()");
  }

  buildShort() {
    // The structure of this object is based off `./docs/resources/package_object_short.json`
    // And should be considered our master reference for the Package Object Short Data Structure
    let obj = {
      name: this.name,
      repository: this.repository,
      downloads: this.downloads,
      stargazers_count: this.stargazers_count,
      releases: {
        latest: this.Versions.getLatestVersionSemver()
      },
      readme: this.readme,
      metadata: this.Versions.getLatestVersionPackageJSON()
    };

    // Here we could use Joi to validate the values within our data structure
    // prior to returning. In the long term this is very much the method we should
    // use, as the API should never be sending out invalid data. But for now TODO
    return obj;
  }

  buildFull() {
    // This object structure is modeled directly off of `./docs/resources/package_object_full.json`
    // Should be considered the master Package Object Full data structure
    let obj = {
      name: this.name,
      repository: this.repository,
      downloads: this.downloads,
      stargazers_count: this.stargazers_count,
      releases: {
        latest: this.Versions.getLatestVersionSemver()
      },
      readme: this.readme,
      metadata: this.Versions.getLatestVersionPackageJSON(),
      versions: this.Versions.buildFullVersions()
    };

    // Again would likely in the future want to use Joi to validate our object
    return obj;
  }

}

class Version {
  constructor() {
    this.latestSemver = null;
    this.versions = {};
    this.semverInitRegex = /^\s*v/i;
  }

  addVersion(value) {
    throw new Error("Not Implmented! ~ Version.addVersion()");
  }

  addVersions(values) {
    for (const value in values) {
      this.addVersion(value);
    }
    return this;
  }

  addSemver(semver) {
    // Allows adding a standalone semver to the version list.
    if (this.versions[semver]) {
      logger.generic(3, `Version.addSemver() called with semver already within range! ${semver}`);
      return this;
    }

    this.versions[semver] = {};

    // Now to determine if our newer semver is larger than the current latestSemver
    if (this.latestSemver === null) {
      this.latestSemver = semver;
    } else {
      if (utils.semverGt(utils.semverArray(semver.replace(this.semverInitRegex, "").trim()), utils.semverArray(this.latestSemver.replace(this.semverInitRegex, "").trim()))) {
        // The provided semver is greater than our current latest
        this.latestSemver = semver;
      }
    }

    return this;
  }

  addTarball(semver, tarballURL) {
    // Takes a valid existing semver to add the url too
    if (!this.versions[semver]) {
      logger.generic(3, `Version.addTarball() called with semver outside known range! ${semver}`);
      return this;
    }

    this.versions[semver].tarball_url = tarballURL;
    return this;
  }

  addSha(semver, sha) {
    // Takes a valid existing semver to add the sha too
    if (!this.versions[semver]) {
      logger.generic(3, `Version.addSHA() called with semver outside known range! ${semver}`);
      return this;
    }

    this.versions[semver].sha = sha;
    return this;
  }

  addPackageJSON(semver, pack) {
    // Takes a valid existing semver to add the package data to
    if (!this.versions[semver]) {
      logger.generic(3, `Version.addPackageJSON() called with semver outside known range! ${semver}`);
      return this;
    }

    this.versions[semver].package = pack;
    return this;
  }

  getLatestVersion() {
    return this.versions[this.latestSemver];
  }

  getLatestVersionSemver() {
    return this.latestSemver;
  }

  getLatestVersionTarball() {
    return this.versions[this.latestSemver].tarball_url;
  }

  getLatestVersionSha() {
    return this.versions[this.latestSemver].sha;
  }

  getLatestVersionPackageJSON() {
    return this.versions[this.latestSemver].package;
  }

  buildFullVersions() {

    let obj = {};

    // this.versions === this.versions.package | this.versions.sha | this.versions.tarball_url
    for (const ver in this.versions) {
      obj[ver] = this.versions[ver].pack;
      obj[ver].dist = {
        tarball: this.versions[ver].tarball_url,
        sha: this.versions[ver].sha
      };
    }

    // This should result in a hashmap of values by the versions of a package
    // where each object holds the full versions package.json with an added dist
    // key that contains the tarball url and sha

    // This is likely where in the future we want to use Joi to validate our object
    return obj;
  }

}

module.exports = PackageObject;

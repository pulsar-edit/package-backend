const parseGithubUrl = require("parse-github-url");

/**
 * @module PackageObject
 * @desc This Module is used to aide in building Package Objects.
 * Allowing a singular location for the proper data structure of a package object.
 * And allowing an easy interface to add, modify, or retreive data about a
 * package object.
 */

const logger = require("./logger.js");
const utils = require("./utils.js");

/**
 * The PackageObject Object Builder
 * @class
 */
class PackageObject {
  constructor() {
    this.Version = new Version();
    this.name = undefined;
    this.ownerRepo = undefined;
    this.repository = {
      type: undefined,
      url: undefined,
    };
    this.downloads = undefined;
    this.stargazers_count = undefined;
    this.readme = undefined;
    this.creationMethod = undefined;
    this.owner = undefined;
  }

  /**
   * @function setName
   * @param {string} packNameString - The Name of the package to set
   * @desc Allows setting the name of the package.
   */
  setName(packNameString) {
    if (typeof packNameString !== "string") {
      logger.generic(
        3,
        `PackageObject.setName() called wtih ${packNameString}::${typeof packNameString}. Ignoring assignment.`
      );
      return this;
    }

    this.name = packNameString;
    return this;
  }

  /**
   * @function setOwnerRepo
   * @param {string} ownerRepoString - The `owner/repo` string combo to set for the package.
   * @desc Allows setting the `owner/repo` of the package.
   */
  setOwnerRepo(ownerRepoString) {
    if (typeof ownerRepoString !== "string") {
      logger.generic(
        3,
        `PackageObject.setOwnerRepo() called with ${ownerRepoString}::${typeof ownerRepoString}. Ignoring assignment.`
      );
      return this;
    }

    let testValidation = ownerRepoString.split("/");

    if (testValidation.length !== 2) {
      // If the name is longer than 2, then it is not owner/repo
      logger.generic(
        3,
        `PackageObject.setOwnerRepo() called with invalid split length value ${ownerRepoString}. Ignoring assignment.`
      );
      return this;
    }

    this.ownerRepo = ownerRepoString;
    return this;
  }

  /**
   * @function setDownloads
   * @param {number|string} downloadCount - The Download count to add.
   * @desc Allows setting the packages download count.
   */
  setDownloads(downloadCount) {
    if (Number.isNaN(parseInt(downloadCount))) {
      logger.generic(
        3,
        `PackageObject.setDownloads() called with invalid argument ${downloadCount}. Ignoring assignment.`
      );
      return this;
    }

    this.downloads = downloadCount;
    return this;
  }

  /**
   * @function setStargazers
   * @param {number|string} stargazerCount - The Stargazers count to add.
   * @desc Allows setting the packages stargazer count.
   */
  setStargazers(stargazerCount) {
    if (Number.isNaN(parseInt(stargazerCount))) {
      logger.generic(
        3,
        `PackageObject.setStargazers() called with invalid argument ${stargazerCount}. Ignoring assignment.`
      );
      return this;
    }

    this.stargazers_count = stargazerCount;
    return this;
  }

  /**
   * @function setReadme
   * @param {string} readmeString - The Full text based readme.
   * @desc Allows setting the packages readme data.
   */
  setReadme(readmeString) {
    if (typeof readmeString !== "string") {
      logger.generic(
        3,
        `PackageObject.setReadme() called with invalid argument type ${readmeString}::${typeof readmeString}. Ignoring assignment.`
      );
      return this;
    }

    this.readme = readmeString;
    return this;
  }

  /**
   * @function setRepository
   * @param {object} repoObject - The repo object containing `type` and `url` keys.
   * @desc Allows setting the repository object of a package. As returned by
   * `VCS.determineProvider()`.
   */
  setRepository(repoObject) {
    if (!repoObject.type || !repoObject.url) {
      logger.generic(
        3,
        `PackageObject.setRepository() called with invalid object ${repoObject}. Ignoring assignment.`
      );
      return this;
    }

    this.repository.type = repoObject.type;
    this.repository.url = repoObject.url;
    return this;
  }

  /**
   * @function setRepositoryType
   * @param {string} repoType - The type of repo.
   * @desc Allows setting the repo type of the package. As returned by `VCS.determineProvider().type`
   */
  setRepositoryType(repoType) {
    this.repository.type = repoType;
    return this;
  }

  /**
   * @function setRepositoryURL
   * @param {string} repoURL - The URL of the repo.
   * @desc Allows setting the repo URL of the package. As returned
   * by `VCS.determineProvider().url`
   */
  setRepositoryURL(repoURL) {
    this.repository.url = repoURL;
    let parsed = parseGithubUrl(repoURL);
    if (parsed) {
      this.owner = parsed.owner;
    }
    return this;
  }

  /**
   * @function setCreationMethod
   * @param {string} method - The creation method of the package.
   * @desc Allows setting a creation method for the package.
   */
  setCreationMethod(method) {
    this.creationMethod = method;
    return this;
  }

  /**
   * @function parse
   * @param {object} pack - N/A
   * @desc Unimplemented function.
   * @todo Implement generic parse()
   */
  parse(pack) {
    // Parse can take a packages data and destructure accordingly
    throw new Error("Not Implemented! ~ PackageObject.parse()");
  }

  /**
   * @function buildShort
   * @desc Returns an object matching the `Package Object Short` format, using provided data.
   */
  buildShort() {
    // The structure of this object is based off `./docs/resources/package_object_short.json`
    // And should be considered our master reference for the Package Object Short Data Structure
    let obj = {
      name: this.name,
      owner: this.owner,
      repository: this.repository,
      downloads: this.downloads,
      stargazers_count: this.stargazers_count,
      releases: {
        latest: this.Version.getLatestVersionSemver(),
      },
      readme: this.readme,
      metadata: this.Version.getLatestVersionPackageJSON(),
    };

    // Here we could use Joi to validate the values within our data structure
    // prior to returning. In the long term this is very much the method we should
    // use, as the API should never be sending out invalid data. But for now TODO
    return obj;
  }

  /**
   * @function buildFull
   * @desc Returns an object matching the `Package Object Full` format.
   * Using the provided data.
   */
  buildFull() {
    // This object structure is modeled directly off of `./docs/resources/package_object_full.json`
    // Should be considered the master Package Object Full data structure
    let obj = {
      name: this.name,
      owner: this.owner,
      repository: this.repository,
      downloads: this.downloads,
      stargazers_count: this.stargazers_count,
      creation_method: this.creationMethod,
      releases: {
        latest: this.Version.getLatestVersionSemver(),
      },
      readme: this.readme,
      metadata: this.Version.getLatestVersionPackageJSON(),
      versions: this.Version.buildFullVersions(),
    };

    // Again would likely in the future want to use Joi to validate our object
    return obj;
  }
}

/**
 * A version object to help build package objects `Version` data. Accessible
 * from the PackageObject via `PackageObject.Version`
 * @class
 */
class Version {
  constructor() {
    this.latestSemver = undefined;
    this.versions = {};
    this.semverInitRegex = /^\s*v/i;
  }

  /**
   * @function addVersion
   * @param {object} value - N/A
   * @desc Unimplemented function.
   * @todo Implement Agnostic `addVersion()`
   */
  addVersion(value) {
    throw new Error("Not Implmented! ~ Version.addVersion()");
  }

  /**
   * @function addVersions
   * @param {object[]} values - N/A
   * @desc An array handling variant that relies on the the unimplmented `addVersion`
   * @todo Implement Agnostic `addVersion()`
   */
  addVersions(values) {
    for (const value in values) {
      this.addVersion(value);
    }
    return this;
  }

  /**
   * @function addSemver
   * @param {string} semver - The Semver to add to the package.
   * @desc Handles adding a new semver value.
   */
  addSemver(semver) {
    // Allows adding a standalone semver to the version list.
    let cleanSemver = this.cleanSemver(semver);

    if (cleanSemver === "") {
      logger.generic(
        3,
        `Version.addSemver() called with invalid semver ${semver}! Ignoring assignment`
      );
      return this;
    }

    if (this.versions[cleanSemver]) {
      logger.generic(
        3,
        `Version.addSemver() called with semver already within range! ${semver}`
      );
      return this;
    }

    this.versions[cleanSemver] = {};

    // Now to determine if our newer semver is larger than the current latestSemver
    if (typeof this.latestSemver === "undefined") {
      this.latestSemver = cleanSemver;
    } else {
      console.log(
        `Latest semver: ${this.latestSemver} - Typeof: ${typeof this
          .latestSemver}`
      );
      if (
        utils.semverGt(
          utils.semverArray(cleanSemver),
          utils.semverArray(this.latestSemver)
        )
      ) {
        // The provided semver is greater than our current latest
        this.latestSemver = cleanSemver;
      }
    }

    return this;
  }

  /**
   * @function cleanSemver
   * @param {string} semver - The Semver to clean.
   * @desc A utility function that will parse and process a `semver` string
   * to remove special characters, and remove any leading `v`s
   */
  cleanSemver(semver) {
    if (typeof semver !== "string") {
      return "";
    }

    return semver.replace(this.semverInitRegex, "").trim();
  }

  /**
   * @function addTarball
   * @param {string} semver - The `semver` to add it to.
   * @param {string} tarballURL - The url of the `tarball` to add.
   * @desc Adds a `tarball` to the version specified.
   */
  addTarball(semver, tarballURL) {
    // Takes a valid existing semver to add the url too
    if (!this.versions[this.cleanSemver(semver)]) {
      logger.generic(
        3,
        `Version.addTarball() called with semver outside known range! ${semver}`
      );
      return this;
    }

    this.versions[this.cleanSemver(semver)].tarball_url = tarballURL;
    return this;
  }

  /**
   * @function addSha
   * @param {string} semver - The `semver` to add it to.
   * @param {string} sha - The SHA to add.
   * @desc Adds a `sha` to the `version` specified.
   */
  addSha(semver, sha) {
    // Takes a valid existing semver to add the sha too
    if (!this.versions[this.cleanSemver(semver)]) {
      logger.generic(
        3,
        `Version.addSHA() called with semver outside known range! ${semver}`
      );
      return this;
    }

    this.versions[this.cleanSemver(semver)].sha = sha;
    return this;
  }

  /**
   * @function addPackageJSON
   * @param {string} semver - The `semver` to add it to.
   * @param {object} pack - The `package.json` to add.
   * @desc Adds a `package.json` to a specific version.
   */
  addPackageJSON(semver, pack) {
    // Takes a valid existing semver to add the package data to
    if (!this.versions[this.cleanSemver(semver)]) {
      logger.generic(
        3,
        `Version.addPackageJSON() called with semver outside known range! ${semver}`
      );
      return this;
    }

    this.versions[this.cleanSemver(semver)].package = pack;
    return this;
  }

  /**
   * @function getLatestVersion
   * @desc Returns the full data of the `latest` version. As stored locally.
   * This likely is not suited for using as any kind of package data.
   */
  getLatestVersion() {
    return this.versions[this.latestSemver];
  }

  /**
   * @function getLatestVersionSemver
   * @desc Returns the `semver` of the `latest` version.
   */
  getLatestVersionSemver() {
    return this.latestSemver;
  }

  /**
   * @function getLatestVersionTarball
   * @desc Returns the `tarball` of the `latest` version.
   */
  getLatestVersionTarball() {
    return this.versions[this.latestSemver].tarball_url;
  }

  /**
   * @function getLatestVersionSha
   * @desc Returns the `sha` of the `latest` version.
   */
  getLatestVersionSha() {
    return this.versions[this.latestSemver].sha;
  }

  /**
   * @function getLatestVersionPackageJSON
   * @desc Returns the `package.json` data for the `latest` semver.
   */
  getLatestVersionPackageJSON() {
    return this.versions[this.latestSemver].package;
  }

  /**
   * @function buildFullVersions
   * @desc Returns an object of the full version object for the versions provided.
   */
  buildFullVersions() {
    let obj = {};

    // this.versions === this.versions.package | this.versions.sha | this.versions.tarball_url
    for (const ver in this.versions) {
      if (typeof this.versions[ver].package !== "object") {
        // Ensure we are always inserting base package data, even if using
        // the current latest as a fallback
        obj[ver] = this.versions[this.latestSemver].package;
      } else {
        obj[ver] = this.versions[ver].package;
      }
      obj[ver].dist = {
        tarball: this.versions[ver].tarball_url,
        sha: this.versions[ver].sha,
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

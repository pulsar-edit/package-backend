/**
 * @module vcs
 * @desc This Module is intended to be the platform agnostic tool to interaction
 * with Version Control Systems of different types in the cloud.
 * To collect data from them, format it accordingly ang return it to the requesting
 * function.
 */

const semver = require("semver");
const query = require("./query_parameters/index.js").logic;
const utils = require("./utils.js");
const constructNewPackagePublishData = require("./models/constructNewPackagePublishData.js");
const GitHub = require("./vcs_providers/github.js");
const ServerStatus = require("./ServerStatusObject.js");
const semVerInitRegex = /^\s*v/i;

/**
 * @async
 * @function ownership
 * @desc Allows the ability to check if a user has permissions to write to a repo.
 * <b>MUST</b> be provided the full `user` and `package` objects here to account
 * for possible situations. This allows any new handling that's needed to be defined
 * here rather than in multiple locations throughout the codebase.
 * Returns `ok: true` where content is the repo data from the service provider on
 * success, returns `ok: false` if they do not have access to said repo, with
 * specificity available within the `short` key.
 * @param {object} userObj - The Full User Object, as returned by the backend,
 * and appended to with authorization data.
 * @param {object|string} packObj - The full Package objects data from the backend.
 * Although, can also contain a string, this string would directly be
 * an Owner/Repo combo, but it is recommended to use the Package Object when
 * possible. The string variant is intended to be used when first publishing
 * a package, and there is no package object to use.
 * @param {object} [opts] - An optional configuration object, that allows the
 * definition of non-standard options to change the fucntionality of this function.
 * `opts` can accept the following parameters:
 *  - dev_override: {boolean} - Wether to enable or disable the dev_override. Disabled
 *    by default, this dangerous boolean is inteded to be used during tests that
 *    overrides the default safe static returns, and lets the function run as intended
 *    in development mode.
 * @returns {object} - A Server Status object containing the role of the user according
 * to the repo or otherwise a failure.
 */
async function ownership(userObj, packObj, dev_override = false) {
  // Since the package is already on the DB when attempting to determine ownership
  // (Or is at least formatted correctly, as if it was) We can directly access the
  // repository object provided by determineProvider

  // Below we check for object because if packObj is an object then we were given
  // a full packages object, and we need to extract an owner/repo combo.
  // But if we were passed a string then we instead would use it directly.
  // Since a string should only be passed when there was no package object
  // to provide such as during package publish.
  // Which if we are getting a string, then we will fallback to the default
  // which is GitHub, which will work for now.
  const repoObj =
    typeof packObj.repository === "object"
      ? packObj.repository.type
      : packObj.repository;
  // TODO: Double check validity of Object, but we should have `.type` & `.url`
  // But if this check fails we will assume that repository is a string.
  // We should likely add better protections and validation in the future TODO

  switch (repoObj) {
    // Additional supported VCS systems go here.
    case "git":
    default: {
      const github = new GitHub();

      // Here we check if we were handed an owner/repo combo directly by checking
      // for a string. Otherwise we assume it's a package object where we need to
      // find the owner/repo combo.
      const ownerRepo =
        typeof packObj === "string"
          ? packObj
          : utils.getOwnerRepoFromPackage(packObj);

      const owner = await github.ownership(userObj, ownerRepo);
      // ^^^ Above we pass the full package object since github will decode
      // the owner/repo combo as needed.
      return owner;
    }
  }
}

/**
 * @async
 * @function newPackageData
 * @desc Replaces the previous git.createPackage().
 * Intended to retrieve the full packages data. The data which will contain
 * all information needed to create a new package entry onto the DB.
 * @param {object} userObj - The Full User Object as returned by auth.verifyAuth()
 * @param {string} ownerRepo - The Owner Repo Combo for the package such as `pulsar-edit/pulsar`
 * @param {string} service - The Service this package is intended for.
 * Matching a valid return type from `vcs.determineProvider()` Eventually
 * this service will be detected by the package handler or moved here, but for now
 * is intended to be hardcoded as "git"
 * @returns {object} - Returns a Server Status Object, which when `ok: true`
 * Contains the full package data. This includes the Readme, the package.json, and all version data.
 * @todo Stop hardcoding the service that is passed here.
 */
async function newPackageData(userObj, ownerRepo, service, possibleTag) {
  try {
    let provider = null;
    // Provider above, is the provider that should be assigned to allow interaction
    // with our specific VCS service

    switch (service) {
      case "git":
      default:
        provider = new GitHub();
    }

    let exists = await provider.exists(userObj, ownerRepo);

    if (!exists.ok) {
      // Could be due to an error, or it doesn't exist at all.
      // For now until we support custom error messages will do a catch all
      // return.
      return new ServerStatus()
        .notOk()
        .setContent(`Failed to get repo: ${ownerRepo} - ${exists.short}`)
        .setShort("Bad Repo")
        .build();
    }

    // We will get tags first so that we can utilize specific tags when asking
    // for further information about a package, rather than use the default branch
    // information.
    // See: https://github.com/pulsar-edit/package-backend/issues/205

    let tags;
    if(possibleTag) {
      tags = [{name: possibleTag}];
    } else {
      tags = await provider.tags(userObj, ownerRepo);

      if (!tags.ok) {
        return new ServerStatus()
          .notOk()
          .setContent(`Failed to get gh tags for ${ownerRepo} - ${tags.short}`)
          .setShort("Server Error")
          .build();
      }

      // Sort the tags into descending order
      tags = tags.content.sort((a, b) => {
        return semver.rcompare(a.name, b.name);
      });
    }

    let pack = await provider.packageJSON(
      userObj,
      ownerRepo,
      tags[0]?.name
    );

    if (!pack.ok) {
      return new ServerStatus()
        .notOk()
        .setContent(`Failed to get gh package for ${ownerRepo} - ${pack.short}`)
        .setShort("Bad Package")
        .build();
    }

    // Now to get our Readme
    const readme = await provider.readme(
      userObj,
      ownerRepo,
      tags[0]?.name
    );

    if (!readme.ok) {
      return new ServerStatus()
        .notOk()
        .setContent(
          `Failed to get gh readme for ${ownerRepo} - ${readme.short}`
        )
        .setShort("Bad Repo")
        .build();
    }

    // Now we should be ready to create the package.
    // readme = The text data of the current repo readme
    // tags = API JSON response for repo tags, including the tags, and their
    //        sha hash, and tarball_url
    // pack = the package.json file within the repo, as JSON
    // And we want to funnel all of this data into newPack and return it.
    // This is left for historic research purposes but we now should only use
    // the PackageObject Builder to handle this

    // Then lets add the service used, so we are able to safely find it in the future
    let packRepoObj = determineProvider(pack.content.repository);

    // It's possible the repository field within the `package.json` has a mispelling
    // or is otherwise inaccurate. So we will compare this to our working repo
    if (packRepoObj.type === "na") {
      // We couldn't determine the repo at all from the `package.json`
      packRepoObj = determineProvider(ownerRepo);
    }
    // TODO: While originally I had wanted to check for the possibility of a typo
    // within the repo field, this would break support for transfering of ownership
    // or of changing the repo name. So we may have to live with that possibility.

    let newPack;
    try {
      newPack = constructNewPackagePublishData({
        ownerRepo: ownerRepo,
        provider: packRepoObj,
        packageJson: pack.content,
        tags: tags,
        readme: readme.content,
      });
    } catch (err) {
      console.error(err);
      // We know the errors generated from the constructor
      // are intended to provide insight into what went wrong.
      // So we will assign the content as the actual error
      return new ServerStatus()
        .notOk()
        .setContent(err.toString())
        .setShort("Bad Repo")
        .build();
    }

    // For this we just use the most recent tag published to the repo.
    // and now the object is complete, lets return the pack, as a Server Status Object.
    return new ServerStatus().isOk().setContent(newPack).build();
  } catch (err) {
    // An error occured somewhere during package generation
    return new ServerStatus()
      .notOk()
      .setContent(err)
      .setShort("Server Error")
      .build();
  }
}

/**
 * @async
 * @function newVersionData
 * @desc Replaces the previously used `git.metadataAppendTarballInfo()`
 * Intended to retrieve the most basic of a package's data.
 * Bundles all the special handling of crafting such an object into this single
 * function to reduce usage elsewhere.
 * @param {object} userObj - The Full User Object as returned by `auth.verifyAuth()`
 * @param {string} ownerRepo - The Owner Repo Combo of the package affected.
 * Such as `pulsar-edit/pulsar`
 * @param {string} tagRef - The version number or ref where data should be sought
 * from the remote resource.
 * @param {string} service - The service to use as expected to be returned
 * by `vcs.determineProvider()`. Currently should be hardcoded to "git"
 * @returns {SSO_VCS_newVersionData} A Server Status Object, which when `ok: true`
 * returns all data that would be needed to update a package on the DB, and
 * upload a new version.
 */
async function newVersionData(userObj, ownerRepo, tagRef, service) {
  // Originally when publishing a new version the responsibility to collect
  // all package data fell onto the package_handler itself
  // Including collecting readmes and tags, now this function should encapsulate
  // all that logic into a single place.

  let provider = null;
  // Provider above, is the provider that should be assigned to allow interaction
  // with our specific VCS service

  switch (service) {
    case "git":
    default:
      provider = new GitHub();
  }

  let exists = await provider.exists(userObj, ownerRepo);

  if (!exists.ok) {
    // Could be due to an error, or it doesn't exist at all.
    // For now until we support custom error messages will do a catch all
    // return.
    return new ServerStatus()
      .notOk()
      .setContent(`Failed to get repo: ${ownerRepo} - ${exists.short}`)
      .setShort("Bad Repo")
      .build();
  }

  let pack = await provider.packageJSON(userObj, ownerRepo, tagRef);

  if (!pack.ok) {
    return {
      ok: false,
      short: "Bad Package",
      content: `Failed to get GitHub Package ${ownerRepo} - ${pack.short} - ${pack.content}`,
    };
  }

  // Now we will also need to get the packages data to update on the DB
  // during verison pushes.

  let readme = await provider.readme(userObj, ownerRepo, tagRef);

  if (!readme.ok) {
    return {
      ok: false,
      short: "Bad Repo",
      content: `Failed to get GitHub ReadMe ${ownerRepo} - ${readme.short} - ${readme.content}`,
    };
  }

  let tag = null;

  if (typeof pack.content.version === "object") {
    tag = pack.content.version;
  }

  if (typeof pack.content.version === "string") {
    // Retrieve tag object related to our tagged version string
    const tags = await provider.tags(userObj, ownerRepo);

    if (!tags.ok) {
      return {
        ok: false,
        short: tags.short,
        content: `Failed to get GitHub Tags for ${ownerRepo} - ${tags.short} - ${tags.content}`,
      };
    }

    for (const t of tags.content) {
      if (typeof t.name !== "string") {
        continue;
      }
      const sv = query.engine(t.name.replace(semVerInitRegex, "").trim());
      if (sv === pack.content.version.replace(semVerInitRegex, "").trim()) {
        tag = t;
        break;
      }
    }

    if (tag === null) {
      // If we couldn't find any valid tags that match the tag currently available
      // on the remote package.json
      return {
        ok: false,
        short: "Bad Repo",
        content: `Failed to find a matching tag: ${ownerRepo} - ${pack.content.version}`,
      };
    }
  }

  if (!tag.tarball_url) {
    logger.generic(
      3,
      `Cannot retrieve metadata information for version ${ver} of ${ownerRepo}`
    );
    return {
      ok: false,
      short: "Server Error",
      content: `Failed to find any valid tag data for: ${ownerRepo} - ${tag}`,
    };
  }

  pack.content.tarball_url = tag.tarball_url;
  pack.content.sha = typeof tag.commit?.sha === "string" ? tag.commit.sha : "";

  // Lets protect the repo field in case of error
  let repoField = determineProvider(pack.content.repository);

  if (repoField.type === "na") {
    // THe new version function is only passed `owner/repo` literal, so must be
    // reconstructed. TODO: If support moves beyond GitHub, this will have to check service type
    repoField = determineProvider(`https://github.com/${ownerRepo}`);
  }

  return {
    ok: true,
    content: {
      name: pack.content.name.toLowerCase(),
      repository: repoField,
      readme: readme.content,
      metadata: pack.content,
    },
  };
}

/**
 * @async
 * @function featureDetection
 * @desc Calls the apropriate provider's `featureDetection()` method
 * @param {object} userObj - The Full User Object as returned by `auth.verifyAuth()`
 * @param {string} ownerRepo - The Owner Repo Combo of the package affected.
 * Such as `pulsar-edit/pulsar`
 * @param {string} service - The service to use as expected to be returned
 * by `vcs.determineProvider()`. Currently should be hardcoded to "git"
 * @returns {object} A `featureObject` as provided by the provider.
 */
async function featureDetection(userObj, ownerRepo, service) {
  let provider = null;

  switch (service) {
    case "git":
    default:
      provider = new GitHub();
  }

  let featureObject = await provider.featureDetection(userObj, ownerRepo);

  if (!featureObject.ok) {
    return {
      ok: false,
      short: "Unable to find features",
      content: featureObject.content,
    };
  }

  return featureObject;
}

/**
 * @function determineProvider
 * @desc Determines the repostiry object by the given argument.
 * Takes the `repository` key of a `package.json` and with very little if not no
 * desctructing will attempt to locate the provider service and return an object
 * with it.
 * @param {string|object} repo - The `repository` of the retrieved package.
 * @returns {object} The object related to the package repository type.
 */
function determineProvider(repo) {
  try {
    // First party packages do already have the regular package object.
    // So we will need to check if it's an object or string.
    if (repo === null || repo === undefined) {
      return {
        type: "na",
        url: "",
      };
    }

    // If not null, it's likely a first party package
    // With an already valid package object that can just be returned.
    if (typeof repo === "object") {
      return repo;
    }

    if (typeof repo !== "string") {
      return {
        type: "unknown",
        url: repo,
      };
    }

    // The repo is a string, and we need to determine who the provider is.
    const lcRepo = repo.toLowerCase();

    switch (true) {
      case lcRepo.includes("github"):
        return {
          type: "git",
          url: repo,
        };

      case lcRepo.includes("bitbucket"):
        return {
          type: "bit",
          url: repo,
        };

      case lcRepo.includes("sourceforge"):
        return {
          type: "sfr",
          url: repo,
        };

      case lcRepo.includes("gitlab"):
        return {
          type: "lab",
          url: repo,
        };

      case lcRepo.includes("codeberg"):
        return {
          type: "berg",
          url: repo,
        };

      default:
        // If no other recognized matches exist, return repo with na service provider.
        return {
          type: "unknown",
          url: repo,
        };
    }
  } catch (err) {
    return {
      type: "na",
      url: "",
    };
  }
}

module.exports = {
  determineProvider,
  ownership,
  newPackageData,
  newVersionData,
  featureDetection,
};

/**
 * @module vcs
 * @desc This Module is intended to be the platform agnostic tool to interaction
 * with Version Control Systems of different types in the cloud.
 * To collect data from them, format it accordingly ang return it to the requesting
 * function.
 */

const query = require("./query.js");
const utils = require("./utils.js");
const GitHub = require("./vcs_providers/github.js");
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
 * @param {object} packObj - The full Package objects data from the backend.
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
async function ownership(userObj, packObj, dev_override = false ) {
  // TODO: Ideally we don't have any static fake returns.
  // As we have seen this degrades the accuracy of our tests greatly.
  // Now that we have the whole new Testing System I'd like to move away and remove this
  // code whole sale, as well as the `dev_override`. But in the interest in finishing
  // up this PR, and merging before I become to far off from main, we can keep this system for now.
  // And hopefully rely on our individual vcs tests.
  if (
    process.env.PULSAR_STATUS === "dev" &&
    !dev_override &&
    process.env.MOCK_GH !== "false"
  ) {
    console.log(`git.js.ownership() Is returning Dev Only Permissions for ${userObj.username}`);

    switch(userObj.username) {
      case "admin_user":
        return { ok: true, content: "admin" };
      case "no_perm_user":
        return {
          ok: false,
          content: "Development NoPerms User",
          short: "No Repo Access"
        };
      default:
        return {
          ok: false,
          content: "Server in Dev Mode passed unhandled user",
          short: "Server Error"
        };
     }

   }
  // Non-dev return.

  // Since the package is already on the DB when attempting to determine ownership
  // (Or is at least formatted correctly, as if it was) We can directly access the
  // repository object provided by determineProvider
  let repoObj = packObj.repository;
  // TODO: Double check validity of Object, but we should have `.type` & `.url`

  switch(repoObj.type) {
    // Additional supported VCS systems go here.
    case "git":
    default: {
      const github = new GitHub();
      let owner = await github.ownership(userObj, packObj);
      // ^^^ Above we pass the full package object since github will decode
      // the owner/repo combo as needed.
      return owner;
    }
  }

}

/**
 * NOTE: This function should be used only during a package publish.
 * Intends to use a service passed to check ownership, without expecting any package
 * data to work with. This is because during initial publication, we won't
 * have the package data locally to build off of.
 * Proper use of this service variable will be preceeded by support from ppm to
 * provide it as a query parameter.
 */
async function prepublishOwnership(userObj, ownerRepo, service) {

}

/**
 * NOTE: Replaces createPackage - Intended to retreive the full packages data.
 * I wish we could have more than ownerRepo here, but we can't due to how this process is started.
 * Currently the service must be specified. Being one of the valid types returned
 *   by determineProvider, since we still only support GitHub this can be manually passed through,
 *   but a better solution must be found.
 */
async function newPackageData(userObj, ownerRepo, service) {
  try {

    let provider = null;
    // Provider above, is the provider that should be assigned to allow interaction
    // with our specific VCS service

    switch(service) {
      case "git":
      default:
        provider = new GitHub();
    }

    let newPack = {}; // We will append the new Package Data to this Object

    let exists = await provider.exists(userObj, ownerRepo);

    if (!exists.ok) {
      // Could be due to an error, or it doesn't exist at all.
      // For now until we support custom error messages will do a catch all
      // return.
      return {
        ok: false,
        content: `Failed to get repo: ${ownerRepo} - ${exists.short}`,
        short: "Bad Repo"
      };
    }

    let pack = await provider.packageJSON(userObj, ownerRepo);

    if (!pack.ok) {
      return {
        ok: false,
        content: `Failed to get gh package for ${ownerRepo} - ${pack.short}`,
        short: "Bad Package"
      };
    }

    const tags = await provider.tags(userObj, ownerRepo);

    if (!tags.ok) {
      return {
        ok: false,
        content: `Failed to get gh tags for ${ownerRepo} - ${tags.short}`,
        short: "Server Error"
      };
    }

    // Build a repo tag object indexed by tag names so we can handle versions
    // easily, and won't call query.engine() multiple times for a single version.
    let tagList = {};
    for (const tag of tags.content) {
      if (typeof tag.name !== "string") {
        continue;
      }
      const sv = query.engine(tag.name.replace(semVerInitRegex, "").trim());
      if (sv !== false) {
        tagList[sv] = tag;
      }
    }

    // Now to get our Readme
    const readme = await provider.readme(userObj, ownerRepo);

    if (!readme.ok) {
      return {
        ok: false,
        content: `Failed to get gh readme for ${ownerRepo} - ${readme.short}`,
        short: "Bad Repo"
      };
    }

    // Now we should be ready to create the package.
    // readme = The text data of the current repo readme
    // tags = API JSON response for repo tags, including the tags, and their
    //        sha hash, and tarball_url
    // pack = the package.json file within the repo, as JSON
    // And we want to funnel all of this data into newPack and return it.

    // First we ensure the package name is in the lowercase format.
    const packName = pack.content.name.toLowerCase();

    newPack.name = packName;
    newPack.creation_method = "User Made Package";
    newPack.readme = readme.content;
    newPack.metadata = pack.content; // The metadata tag is the most recent package.json

    // Then lets add the service used, so we are able to safely find it in the future
    const packRepo = determineProvider(pack.content.repository)
    newPack.repository = packRepo;

    // Now during migration packages will have a `versions` key, but otherwise
    // the standard package will just have `version`
    // We build the array of available versions extracted form the package object.
    let versionList = [];
    if (pack.content.versions) {
      for (const v of Object.keys(pack.content.versions)) {
        versionList.push(v);
      }
    } else if (pack.content.version) {
      versionList.push(pack.content.version);
    }

    let versionCount = 0;

    newPack.versions = {};
    // Now to add the release data of each release within the package
    for (const v of versionList) {
      const ver = query.engine(v.replace(semVerInitRegex, ""));
      if (ver === false) {
        continue;
      }

      let tag = tagList[ver];
      if (tag === undefined) {
        continue;
      }

      // They match tag and version, stuff the data into the package

      if (typeof tag === "string") {
        for (const t of tags.content) {
          if (typeof t.name !== "string") {
            continue;
          }
          const sv = query.engine(t.name.replace(semVerInitRegex, "").trim());
          if (sv === tag) {
            tag = t;
            break;
          }
        }
      }

      if (!tag.tarball_url) {
        logger.generic(3, `Cannot retreive metadata info for version ${ver} of packName`);
        continue;
      }

      // The package metadata object should be cloned for every version, otherwise we end up
      // overwriting the tarball info for all previous versions.
      let packVersionMetadata = structuredClone(pack.content);
      // Append metadata info to new object.
      packVersionMetadata.tarball_url = tag.tarball_url;
      packVersionMetadata.sha = typeof tag.commit?.sha === "string" ? tag.commit.sha : "";

      newPack.versions[ver] = constructPackageVersionMetadata(
        packName,
        packRepo,
        readme.content,
        packVersionMetadata,
      );

      // Previosly we used to check the latest version, bur our database now has its own system
      // to sort and determine the latest version, so we here just aggregate the versions
      // in whichever order the provider has sent to us and increase the version count.
      versionCount++;
    }

    if (versionCount === 0) {
      return {
        ok: false,
        content: "Failed to retreive package versions.",
        short: "Server Error"
      };
    }

    // For this we just use the most recent tag published to the repo.
    // and now the object is complete, lets return the pack, as a Server Status Object.
    return {
      ok: true,
      content: newPack
    };

  } catch(err) {
    // An error occured somewhere during package generation
    return {
      ok: false,
      content: err,
      short: "Server Error"
    };
  }
}

/**
 * NOTE: Replaces metadataAppendTarballInfo - Intended to retreive the basics of package data.
 * While additionally replacing all special handling when publishing a version
 * This should instead return an object itself with the required data
 * So in this way the package_handler doesn't have to do anything special
 */
async function newVersionData(userObj, ownerRepo, service) {
  // Originally when publishing a new version the responsibility to collect
  // all package data fell onto the package_handler itself
  // Including collecting readmes and tags, now this function should encapsulate
  // all that logic into a single place.

  let provider = null;
  // Provider above, is the provider that should be assigned to allow interaction
  // with our specific VCS service

  switch(service) {
    case "git":
    default:
      provider = new GitHub();
  }

  let pack = await provider.packageJSON(userObj, ownerRepo);

  if (!pack.ok) {
    return {
      ok: false,
      content: `Failed to get gh package for ${ownerRepo} - ${pack.short}`,
      short: "Bad Package"
    };
  }

  // Now we will also need to get the packages data to update on the DB
  // during verison pushes.

  let readme = await provider.readme(userObj, ownerRepo);

  if (!readme.ok) {
    return {
      ok: false,
      content: `Failed to get gh readme for ${ownerRepo} - ${readme.short}`,
      short: "Bad Repo"
    };
  }

  let tag = null;

  if (typeof pack.content.version === "object") {
    tag = pack.content.version;
  }

  if (typeof pack.content.version === "string") {
    // Retreive tag object related to our tagged version string
    const tags = await provider.tags(userObj, ownerRepo);

    if (!tags.ok) {
      return {
        ok: false,
        content: `Failed to get gh tags for ${ownerRepo} - ${tags.short}`,
        short: "Server Error"
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
        content: `Failed to find a matching tag: ${ownerRepo} - ${pack.content.version}`,
        short: "Server Error"
      };
    }
  }

  if (!tag.tarball_url) {
    logger.generic(3, `Cannot retreive metadata information for version ${ver} of ${ownerRepo}`);
    return {
      ok: false,
      content: `Failed to find any valid tag data for: ${ownerRepo} - ${tag}`,
      short: "Server Error"
    };
  }

  pack.content.tarball_url = tag.tarball_url;
  pack.content.sha = typeof tag.commit?.sha === "string" ? tag.commit.sha : "";

  return {
    ok: true,
    content: constructPackageVersionMetadata(
      pack.content.name.toLowerCase(),
      determineProvider(pack.content.repository),
      readme.content,
      pack.content,
    ),
  };

}

/**
 * @function determineProvider
 * @desc Determines the repository object by the given argument.
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
        url: ""
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
        url: repo
      };
    }

    // The repo is a string, and we need to determine who the provider is.
    const lcRepo = repo.toLowerCase();

    switch(true) {
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
          url: repo
        };

      default:
        // If no other recognized matches exist, return repo with na service provider.
        return {
          type: "unknown",
          url: repo,
        };
    }

  } catch(err) {
    return {
      type: "na",
      url: ""
    };
  }
}

/**
 * @function constructPackageVersionMetadata
 * @desc Internal util to be used to construct and return a package version metadata objects by the given arguments.
 * @param {string} name - Package name.
 * @param {object} repository - Repository object, usually obtained by determineProvider().
 * @param {string|object} readme - The `readme` of the package.
 * @param {object} repo - The full metadata object of the version of the package.
 * @returns {object} The metadata object of the package repository type.
 */
function constructPackageVersionMetadata(name, repository, readme, metadata) {
  return {
    name,
    repository,
    readme,
    metadata,
  }
}

module.exports = {
  determineProvider,
  ownership,
  newPackageData,
  newVersionData,
  prepublishOwnership,
};

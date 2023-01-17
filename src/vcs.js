/**
 * @module vcs
 * @desc This Module is intended to be the platform agnostic tool to interaction
 * with Version Control Systems of different types in the cloud.
 * To collect data from them, format it accordingly ang return it to the requesting
 * function.
 */

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
async function ownership(userObj, packObj, opts = { dev_override: false }) {
  if (
    process.env.PULSAR_STATUS === "dev" &&
    !dev_override &&
    process.env.MOCK_GH !== "false"
  ) {
    console.log(`git.js.ownership() Is returning Dev Only Permissions for ${user.username}`);


  }
  // Non-dev return.

  // Since the package is already on the DB when attempting to determine ownership
  // (Or is at least formatted correctly, as if it was) We can directly access the
  // repository object provided by determineProvider
  let repoObj = packObj.repository;
  // TODO: Double check validity of Object, but we should have `.type` & `.url`

  let owner;

  switch(repoObj.type) {
    // Additional supported VCS systems go here.
    case "git":
    default:
      const github = new GitHub();
      let owner = await github.ownership(userObj, packObj);
      // ^^^ Above we pass the full package object since github will decode
      // the owner/repo combo as needed.
      return owner;
  }

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

    switch(service) {
      case "git":
      default:
        const github = new GitHub();

        let newPack = {}; // We will append the new Package Data to this Object

        let exists = await github.exists(userObj, ownerRepo);

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

        let pack = await github.packageJSON(userObj, ownerRepo);

        if (!pack.ok) {
          return {
            ok: false,
            content: `Failed to get gh package for ${ownerRepo} - ${pack.short}`,
            short: "Bad Package"
          };
        }

        const tags = await github.tags(userObj, ownerRepo);

        if (!tags.ok) {
          return {
            ok: false,
            content: `Failed to get gh tags for ${ownerRepo} - ${tags.short}`,
            short: "Server Error"
          };
        }

        // Build a repo tag object indexed by tag names so we can handle versions
        // easily, and won't call query.engien() multiple times for a single version.
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
        let readme = await github.readme(userObj, ownerRepo);

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

        const time = Date.now();

        // First we ensure the package name is in the lowercase format.
        const packName = pack.content.name.toLowerCase();

        newPack.name = packName;
        newPack.created = time;
        newPack.updated = time;
        newPack.creation_method = "User Made Package";
        newPack.downloads = 0;
        newPack.stargazers_count = 0;
        newPack.star_gazers = [];
        newPack.readme = readme.content;
        newPack.metadata = pack.content; // The metadata tag is the most recent package.json

        // Then lets add the service used, so we are able to safely find it in the future
        newPack.repository = determineProvider(pack.content.repository);

        // Now during migration packages will have a `versions` key, but otherwise
        // the standard package will just have `version`
        // We build the array of available versions extracted form the package object.
        let versionList = [];
        if (pack.content.versions) {
          for (const v of Object.keys(pack.content.versions)) {
            versionList.push(v);
          }
        } else if (pack.content.verison) {
          versionList.push(pack.content.version);
        }

        let versionCount = 0;
        let latestVersion = null;
        let latestSemverArr = null;
        newPack.versions = {};
        // Now to add the release data of each release within the package
        for (const v of versionList) {
          const ver = query.engine(v);
          if (ver === false) {
            continue;
          }

          const tag = tagList[ver];
          if (tag === undefined) {
            continue;
          }

          // They match tag and version, stuff the data into the package
          // TODO: metadataAppendTarballInfo destructing
          // await metadataAppendTarballInfo(pack, tag, user);
          // function metadataAppendTarballInfo(pack, repo, user) {

          
        }
    }

  } catch(err) {

  }
}

/**
 * NOTE: Replaces metadataAppendTarballInfo - Intended to retreive the basics of package data.
 * While additionally replacing all special handling when publsihing a version
 * This should instead return an object itself with the required data
 * So in this way the package_handler doesn't have to do anything special
 */
async function newVersionData() {

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

module.exports = {
  determineProvider,
  ownership,
  newPackageData,
  newVersionData,
};

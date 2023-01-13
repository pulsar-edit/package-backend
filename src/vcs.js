/**
 * @module vcs
 * @desc This Module is intended to be the platform agnostic tool to interaction
 * with Version Control Systems of different types in the cloud.
 * To collect data from them, format it accordingly ang return it to the requesting
 * function.
 */

const GitHub = require("./vcs_providers/github.js");

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
 * @function readme
 * @desc Intended to retreive the ReadMe, or major entry documentation of a package.
 * Will utilize whatever service specified in order to collect it.
 * @param {object} userObj - The Raw Useer Object after verification.
 * @param {string} ownerRepo - The `owner/repo` string combo for the repo.
 * @param {string} service - The name of the service as expected to be returned
 * by vcs.determineProvider(). It's required as a parameter rather than done itself
 * since the situations when a readme is collected don't have the same structured
 * data to request, and as such there is no positive way to know what data will
 * be available for this function to determine the provider.
 */
async function readme(userObj, ownerRepo, service) {
  if (
    process.env.PULSAR_STATUS === "dev" &&
    process.env.MOCK_GH !== "false"
  ) {
    console.log(`git.js.readme() Is returning Dev Only Permissions for ${user.username}`);

  }
  // Non-dev return.

  switch(service) {
    // Other services added here
    case "git":
    default:
      const github = new GitHub();
      return await github.readme(userObj, ownerRepo);
  }
  )
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
  readme,
};

/**
 * @module GitHub
 * @desc A VCS Module to allow `vcs.js` to interact with GitHub as needed. Utilizing `git.js`
 */

const Git = require("./git.js");
const utils = require("../utils.js");

/**
 * @class GitHub
 * @classdesc The GitHub class serves as a way for `vcs` to interact directly with
 * GitHub when needed. This Class extends `Git` to provide the standard functions
 * expected of a VCS service.
 */
class GitHub extends Git {
  constructor(opts) {

    super({
      api_url: opts?.api_url ?? "https://api.github.com",
      ok_status: [200, 401, 404]
    });
  }

  /**
   * @async
   * @function ownership
   * @desc The main `ownership` function, as called by `vcs.ownership()` that will
   * relegate off to `this.doesUserHaveRepo()` to determine the access level the user
   * has over the repo, and will return accordingly. Mostly processing errors.
   * @param {object} user - The User Object as retreived during verification.
   * @param {object} pack - The Package Object, as retreived from the Database.
   */
  async ownership(user, pack) {
    // expects full userObj, and repoObj
    let ownerRepo = utils.getOwnerRepoFromPackage(pack.data);

    let owner = await this.doesUserHaveRepo(user, ownerRepo);

    if (owner.ok) {
      // We were able to confirm the ownership of the repo just fine and can return.
      return owner;
    }

    switch(owner.short) {
      case "No Access":
        // The user does not have any access to the repo.
        return { ok: false, short: "No Repo Access" };
      case "Bad Auth":
        // TODO: Properly handle token refresh
        return {
          ok: false,
          short: "Server Error",
          content: owner.short,
        };
      default:
        return {
          ok: false,
          short: "Server Error",
          content: owner.short
        };
    }
  }

  /**
   * @async
   * @function doesUserHaveRepo
   * @desc Determines if the specified user has write access to the specified
   * repository. It contacts GitHub APIs recursively to discover all users that have
   * access to the specified repository, which when/if finding the specified
   * user, will determine the amount of access that user has to the repo. Which
   * if sufficient, will return a successful Server Status Object along with
   * their `role_name` on the repository.
   * @param {object} user - The User Object from verification
   * @param {string} ownerRepo - The `owner/repo` combo string.
   * @param {number} [page] - The optional page used to determine what page of results
   * to search for the user. This is used for the function to call itself recursively.
   * @returns {object} - A Server Status Object which when successful contains
   * the `role_name` as `content` that the user has over the given repo.
   */
  async doesUserHaveRepo(user, ownerRepo, page = 1) {
    try {
      let check = await this._webRequestAuth(`/repos/${ownerRepo}/contributors?page=${page}`, user.token);

      if (!check.ok) {
        if (check.short === "Failed Request") {
          // This means the request failed with a non 200 HTTP Status Code.
          // Looking into the error could tell us if the token is expired or etc.
          switch(check.content.status) {
            case 401:
              return {
                ok: false,
                short: "Bad Auth"
              };
            default:
              return {
                ok: false,
                short: "Server Error"
              };
          }
        }
        // Otherwise the short is something else. Likely a server error, and
        // we will want to return a server error.
        return {
          ok: false,
          short: "Server Error"
        };
      }

      for (let i = 0; i < check.content.body.length; i++) {
        if (check.content.body[i].node_id === user.node_id) {
          // We have now found the user in the list of all users
          // with access to this repo.
          // Now we just want to ensure that they have the proper permissions.
          if (check.content.body[i].permissions.admin === true ||
              check.content.body[i].permissions.maintain === true ||
              check.content.body[i].permissions.push === true) {
            // We will associate a user as having ownership of a repo if they
            // are able to make writable changes. So as such, with any of the above
            // permissions.

            return {
              ok: true,
              content: check.content.body[i].role_name
            };
          } else {
            // Since we have confirmed we have found the user, but they do not have
            // the required permission to publish we can return especially for this.
            return {
              ok: false,
              short: "No Access",
              content: "The User does not have permission to this repo."
            };
          }
        }
      }

      // After going through every repo returned, we haven't found a repo
      // that the user owns. Lets check if there's multiple pages of returns.
      const nextPage = page + 1;
      if (check.content.headers.link.includes(`?page=${nextPage}`)) {
        // We have another page available via the page headers
        // Lets call this again with the next page
        return await this.doesUserHaveRepo(user, ownerRepo, nextPage);
      }

      // There are no additional pages. Return that we don't have access
      return {
        ok: false,
        short: "No Access"
      };

    } catch(err) {
      // We encounted an exception that's not related to the webrequest.
      return {
        ok: false,
        short: "Server Error",
        content: err
      };
    }
  }

  /**
   * @async
   * @function readme
   * @desc Returns the Readme from GitHub for the specified owner/repo combo, with
   * the specified users credentials.
   * @param {object} userObj - The Raw User Object after verification.
   * @param {string} ownerRepo - The `owner/repo` combo of the repository to get.
   * @returns {object} A Server Status Object where content is the Markdown text of a readme.
   */
  async readme(userObj, ownerRepo) {
    try {

      const readmeRaw = await this._webRequestAuth(`/repos/${ownerRepo}/contents/readme`, userObj.token);
      // Using just `/readme` will let GitHub attempt to get the repos prefferred readme file,
      // so we don't have to check mutliple times.
      // https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-a-repository-readme
      if (!readmeRaw.ok) {
        if (readmeRaw.short === "Failed Request") {
          switch(readmeRaw.content.status) {
            case 401:
              return {
                ok: false,
                short: "Bad Auth"
              };
            default:
              return {
                ok: false,
                short: "Server Error"
              };
          }
        }
        // The HTTP error is not accounted for, so lets return a server error.
        return {
          ok: false,
          short: "Server Error"
        };
      }

      // We have likely received a valid readme.
      // So lets go ahead and return the Readme
      return {
        ok: true,
        content: Buffer.from(readmeRaw.content.body.content, readmeRaw.content.body.encoding).toString()
      };

    } catch(err) {
      return {
        ok: false,
        short: "Server Error",
        content: err
      };
    }
  }

  /**
   * @async
   * @function tags
   * @desc Returns all tags associated with a GitHub repo.
   * @param {object} useObj - The Full User Object as received after verification.
   * @param {string} ownerRepo - The String combo of `onwer/repo` for the package.
   * @returns {object} A Server Status Object, which when successful, whose `content`
   * is all the tags of the specified repo.
   * @see https://docs.github.com/en/rest/repos/repos#list-repository-tags
   */
  async tags(userObj, ownerRepo) {
    try {
      const raw = this._webRequestAuth(`/repos/${ownerRepo}/tags`, userObj.token);

      if (!raw.ok) {
        if (raw.short === "Failed Request") {
          switch(raw.content.status) {
            case 401:
              return {
                ok: false,
                short: "Bad Auth"
              };
            default:
              return {
                ok: false,
                short: "Server Error"
              };
          }
        }
        return {
          ok: false,
          short: "Server Error"
        };
      }

      // We have valid tags, lets return.
      return {
        ok: true,
        content: raw.content
      };

    } catch(err) {
      return {
        ok: false,
        short: "Server Error",
        content: err
      };
    }
  }

  /**
   * @async
   * @function packageJSON
   * @desc Returns the JSON Parsed text of the `package.json` on a GitHub repo.
   * @param {object} userObj - The Full User Object as received after verification.
   * @param {string} ownerRepo - The String combo of `owner/repo` for the package
   * @returns {object} A Server Status Object, which when successfully, whose `content`
   * Is the JSON parsed `package.json` of the repo specified.
   */
  async packageJSON(userObj, ownerRepo) {
    try {
      const raw = await this._webRequestAuth(`/repos/${ownerRepo}/contents/package.json`, userObj.token);

      if (!raw.ok) {
        if (raw.short === "Failed Request") {
          switch(raw.content.status) {
            case 401:
              return {
                ok: false,
                short: "Bad Auth"
              };
            default:
              return {
                ok: false,
                short: "Server Error"
              };
          }
        }
        return {
          ok: false,
          short: "Server Error"
        };
      }

      // We have valid data, lets return after processing
      return {
        ok: true,
        content: JSON.parse(Buffer.from(raw.body.content, raw.body.encoding).toString())
      };

    } catch(err) {
      return {
        ok: false,
        short: "Server Error",
        content: err
      };
    }
  }

  /**
   * @async
   * @function exists
   * @desc This function is used to verify whether a specific package exists on GitHub.
   * @param {object} userObj - The Full User Object as returned from verification.
   * @param {string} ownerRepo - The String combo of `owner/repo`
   * @returns {object} A Server Status Object, whose, when successful, will return
   * the `full_name` of the package as returned by GitHub. (This could be helpful in
   * finding a renamed package)
   */
  async exists(userObj, ownerRepo) {
    try {
      const = await this._webRequestAuth(`/repos/${ownerRepo}`, userObj.token);

      if (!raw.ok) {
        if (raw.short === "Failed Request") {
          switch(raw.content.status) {
            case 401:
              return {
                ok: false,
                short: "Bad Auth"
              };
            case 404:
              return {
                ok: false,
                short: "Bad Repo"
              };
            default:
              return {
                ok: false,
                short: "Server Error"
              };
          }
        }
        return {
          ok: false,
          short: "Server Error"
        };
      }

      // We have valid data
      return {
        ok: true,
        content: raw.body.full_name
      };
    } catch(err) {
      return {
        ok: false,
        short: "Server Error",
        content: err
      };
    }
  }
}

module.exports = GitHub;

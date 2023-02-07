/**
* This Document is intended to house all `typedef` comments used within
* the codebase.
* It's existance and location serves two purposes:
*   - Having this located within docs lets it be properly discoverable as
*     documentation about the object structures we use.
*   - But having it as a JavaScript file means it can be included into our
*     JSDoc Source Code Documentation - ../reference/Source_Documentation.md
*/

/**
  * The Generic Object that should be returned by nearly every function
  * within every module. Allows ease of bubbling errors to the HTTP Handler.
  * @see {@link docs/reference/bubbled_errors.md}
 * @typedef {object} ServerStatusObject
 * @property {boolean} ok - Indicates if the overall function was successful.
 * @property {*} content - The returned data of the request. Can be anything.
 * @property {string} [short] - Only included if `ok` is false. Includes a
 * generic reason the request failed.
 */

// =============================================================================
// ========================= VCS ===============================================
// =============================================================================

/**
 * The Server Status Object returned by `vcs.newVersionData()` containing all
 * the data needed to update a packages version.
 * @typedef {object} SSO_VCS_newVersionData
 * @property {boolean} ok - Indicates if the overall function was successful.
 * @property {string} [short] - Only included if `ok: false`. Includes the generic
 * reason the request failed.
 * @property {string|object} content - When `ok: false` returns a string error
 * but when `ok: true` returns an object further documented below.
 * @property {string} content.name - The Lowercase string of the packages name.
 * As taken from the `package.json` content at it's remote repository.
 * @property {object} content.repository - The returned repository object as
 * returned by `vcs.determineProvider()` when passed the remote `package.json`s
 * `repository` key.
 * @property {string} content.repository.type - A string representing the service
 * vcs name of where the repo is located. One of the valid types returned by
 * `vcs.determineProvider()`
 * @property {string} content.repository.url - A String URL of where the remote
 * repository is located.
 * @property {string} content.readme - The Text based readme of the package, as
 * received from it's remote repository.
 * @property {object} content.metadata - Largely made up of the remote `package.json`
 * Where it will include all fields as found in the remote file. While additionally
 * adding a few others which will be documented here.
 * @property {string} content.metadata.tarball_url - The URL of the tarball download
 * for the newest tag published for the package.
 * @property {string} content.metadata.sha - The SHA hash of the `tarball_url`
 */

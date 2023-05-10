/**
 * @module user_handler
 * @desc Handler for endpoints whose slug after `/api/` is `user`.
 */

const logger = require("../logger.js");
const utils = require("../utils.js");

/**
 * @async
 * @function getLoginStars
 * @desc Endpoint that returns another users Star Gazers List.
 * @param {object} params - The query parameters for the request
 * @param {string} params.login - The username
 * @param {module} db - An instance of the `database.js` module
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/users/:login/stars
 */
async function getLoginStars(params, db) {
  let user = await db.getUserByName(params.login);

  if (!user.ok) {
    return {
      ok: false,
      content: user,
    };
  }

  let pointerCollection = await db.getStarredPointersByUserID(user.content.id);

  if (!pointerCollection.ok) {
    return {
      ok: false,
      content: pointerCollection,
    };
  }

  // Since even if the pointerCollection is okay, it could be empty. Meaning the user
  // has no stars. This is okay, but getPackageCollectionByID will fail, and result
  // in a not found when discovering no packages by the ids passed, which is none.
  // So we will catch the exception of pointerCollection being an empty array.

  if (
    Array.isArray(pointerCollection.content) &&
    pointerCollection.content.length === 0
  ) {
    // Check for array to protect from an unexpected return
    return {
      ok: true,
      content: [],
    };
  }

  let packageCollection = await db.getPackageCollectionByID(
    pointerCollection.content
  );

  if (!packageCollection.ok) {
    return {
      ok: false,
      content: packageCollection,
    };
  }

  packageCollection = await utils.constructPackageObjectShort(
    packageCollection.content
  );

  return {
    ok: true,
    content: packageCollection,
  };
}

/**
 * @async
 * @function getAuthUser
 * @desc Endpoint that returns the currently authenticated Users User Details
 * @param {object} params - The query parameters for this endpoint
 * @param {string} params.auth - The API Key
 * @param {module} db - An instance of the `database.js` module
 * @param {module} auth - An instance of the `auth.js` module
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/users
 */
async function getAuthUser(params, db, auth) {
  const user = await auth.verifyAuth(params.auth, db);

  if (!user.ok) {
    return {
      ok: false,
      content: user,
    };
  }

  // TODO We need to find a way to add the users published pacakges here
  // When we do we will want to match the schema in ./docs/returns.md#userobjectfull
  // Until now we will return the public details of their account.
  const returnUser = {
    username: user.content.username,
    avatar: user.content.avatar,
    created_at: user.content.created_at,
    data: user.content.data,
    node_id: user.content.node_id,
    token: user.content.token, // Since this is for the auth user we can provide token
    packages: [], // Included as it should be used in the future
  };

  // Now with the user, since this is the authenticated user we can return all account details.

  return {
    ok: true,
    content: returnUser,
  };
}

/**
 * @async
 * @function getUser
 * @desc Endpoint that returns the user account details of another user. Including all packages
 * published.
 * @param {object} params - The query parameters
 * @param {string} params.login - The Username we want to look for
 * @param {module} db - An instance of the `database.js` module
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/users/:login
 */
async function getUser(params, db) {
  let user = await db.getUserByName(params.login);

  if (!user.ok) {
    return {
      ok: false,
      content: user,
    };
  }

  // TODO We need to find a way to add the users published pacakges here
  // When we do we will want to match the schema in ./docs/returns.md#userobjectfull
  // Until now we will return the public details of their account.

  // Although now we have a user to return, but we need to ensure to strip any sensitive details
  // since this return will go to any user.
  const returnUser = {
    username: user.content.username,
    avatar: user.content.avatar,
    created_at: user.content.created_at,
    data: user.content.data,
    packages: [], // included as it should be used in the future
  };

  return {
    ok: true,
    content: returnUser,
  };
}

module.exports = {
  getLoginStars,
  getAuthUser,
  getUser,
};

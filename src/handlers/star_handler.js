/**
 * @module star_handler
 * @desc Handler for any endpoints whose slug after `/api/` is `star`.
 */

const logger = require("../logger.js");
const utils = require("../utils.js");

/**
 * @async
 * @function getStars
 * @desc Endpoint for `GET /api/stars`. Whose endgoal is to return an array of all packages
 * the authenticated user has stared.
 * @param {object} param - The supported query parameters.
 * @param {string} param.auth - The authentication API token
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/stars
 */
async function getStars(params, db, auth) {

  let user = await auth.verifyAuth(params.auth, db);

  if (!user.ok) {
    logger.generic(3, "getStars auth.verifyAuth() Not OK", {
      type: "object",
      obj: user,
    });
    return {
      ok: false,
      content: user
    };
  }

  let userStars = await db.getStarredPointersByUserID(user.content.id);

  if (!userStars.ok) {
    logger.generic(3, "getStars database.getStarredPointersByUserID() Not OK", {
      type: "object",
      obj: userStars,
    });
    return {
      ok: false,
      content: userStars
    };
  }

  if (userStars.content.length === 0) {
    logger.generic(6, "getStars userStars Has Length of 0. Returning empty");
    // If we have a return with no items, means the user has no stars.
    // And this will error out later when attempting to collect the data for the stars.
    // So we will reutrn here
    return {
      ok: true,
      content: []
    };
  }

  let packCol = await db.getPackageCollectionByID(userStars.content);

  if (!packCol.ok) {
    logger.generic(3, "getStars database.getPackageCollectionByID() Not OK", {
      type: "object",
      obj: packCol,
    });
    return {
      ok: false,
      content: packCol
    };
  }

  let newCol = await utils.constructPackageObjectShort(packCol.content);

  return {
    ok: true,
    content: newCol
  };
}

module.exports = {
  getStars,
};

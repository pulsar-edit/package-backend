/**
 * @module oauth_handler
 * @desc Endpoint Handlers for Authentication URLs
 * @implements {config}
 * @implements {common_handler}
 */

const {
  GH_CLIENTID,
  GH_REDIRECTURI,
  GH_CLIENTSECRET,
  GH_USERAGENT,
} = require("../config.js").getConfig();
const common = require("./common_handler.js");
const utils = require("../utils.js");
const logger = require("../logger.js");
const superagent = require("superagent");
const database = require("../database.js");

/**
 * @async
 * @function getLogin
 * @desc Endpoint used to redirect users to login. Users will reach GitHub OAuth Page
 * based on the backends client id. A key from crypto module is retrieved and used as
 * state parameter for GH authentication.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/lgoin
 */
async function getLogin(req, res) {
  // The first point of contact to log into the app.
  // Since this will be the endpoint for a user to login, we need to redirect to GH.
  // @see https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
  logger.generic(4, "New Hit on api/login");

  // Generate a random key.
  const stateKey = utils.generateRandomString(64);

  // Before redirect, save the key into the database.
  const saveStateKey = await database.authStoreStateKey(stateKey);
  if (!saveStateKey.ok) {
    await common.handleError(req, res, saveStateKey);
    return;
  }

  res
    .status(302)
    .redirect(
      `https://github.com/login/oauth/authorize?client_id=${GH_CLIENTID}&redirect_uri=${GH_REDIRECTURI}&state=${stateKey}&scope=public_repo%20read:org`
    );
  logger.generic(4, `Generated a new key and made the Redirect for: ${req.ip}`);
  logger.httpLog(req, res);
}

/**
 * @async
 * @function getOauth
 * @desc Endpoint intended to use as the actual return from GitHub to login.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/oath
 */
async function getOauth(req, res) {
  let params = {
    state: req.query.state ?? "",
    code: req.query.code ?? "",
  };
  logger.generic(4, "Get OAuth Hit!");

  // First we want to ensure that the received state key is valid.
  const validStateKey = await database.authCheckAndDeleteStateKey(params.state);
  if (!validStateKey.ok) {
    logger.generic(3, `Provided State Key is NOT Valid!`);
    await common.handleError(req, res, validStateKey);
    return;
  }

  logger.generic(4, "The State Key is Valid and has been Removed");

  // Retrieve access token
  const initialAuth = await superagent
    .post(`https://github.com/login/oauth/access_token`)
    .query({
      code: params.code,
      redirect_uri: GH_REDIRECTURI,
      client_id: GH_CLIENTID,
      client_secret: GH_CLIENTSECRET,
    });

  const accessToken = initialAuth.body?.access_token;

  if (
    accessToken === null ||
    initialAuth.body?.token_type === null
  ) {
    logger.generic(2, "Auth Request to GitHub Failed!", {
      type: "object",
      obj: initialAuth,
    });
    await common.handleError(req, res, {
      ok: false,
      short: "Server Error",
      content: initialAuth,
    });
    return;
  }

  try {
    // Request the user data using the access token
    const userData = await superagent
      .get("https://api.github.com/user")
      .set({ Authorization: `Bearer ${accessToken}` })
      .set({ "User-Agent": GH_USERAGENT });

    if (userData.status !== 200) {
      logger.generic(2, "User Data Request to GitHub Failed!", {
        type: "object",
        obj: userData,
      });
      await common.handleError(req, res, {
        ok: false,
        short: "Server Error",
        content: userData,
      });
      return;
    }

    // Now retrieve the user data thet we need to store into the DB.
    const username = userData.body.login;
    const userId = userData.body.node_id;
    const userAvatar = userData.body.avatar_url;

    const userExists = await database.getUserByNodeID(userId);

    if (userExists.ok) {
      logger.generic(4, `User Check Says User Exists: ${username}`);
      // This means that the user does in fact already exist.
      // And from there they are likely reauthenticating,
      // But since we don't save any type of auth tokens, the user just needs a new one
      // and we should return their new one to them.

      // Now we redirect to the frontend site.
      res.redirect(`https://web.pulsar-edit.dev/users?token=${accessToken}`);
      logger.httpLog(req, res);
      return;
    }

    // The user does not exist, so we save its data into the DB.
    let createdUser = await database.insertNewUser(username, userId, userAvatar);

    if (!createdUser.ok) {
      logger.generic(2, `Creating User Failed! ${userObj.username}`);
      await common.handleError(req, res, createdUser);
      return;
    }

    // Before returning, lets append their access token
    createdUser.content.token = accessToken;

    // Now we redirect to the frontend site.
    res.redirect(
      `https://web.pulsar-edit.dev/users?token=${createdUser.content.token}`
    );
    logger.httpLog(req, res);
  } catch (err) {
    logger.generic(2, "/api/oauth Caught an Error!", {
      type: "error",
      err: err,
    });
    await common.handleError(req, res, err);
    return;
  }
}

/**
 * @async
 * @function getPat
 * @desc Endpoint intended to Allow users to sign up with a Pat Token.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/pat
 */
async function getPat(req, res) {
  let params = {
    token: req.query.token ?? "",
  };

  logger.generic(4, `Get Pat Hit!`);

  if (params.pat === "") {
    logger.generic(3, "Pat Empty on Request");
    await common.handleError(req, res, {
      ok: false,
      short: "Not Found",
      content: "Pat Empty on Request",
    });
    return;
  }

  try {
    const userData = await superagent
      .get("https://api.github.com/user")
      .set({ Authorization: `Bearer ${params.token}` })
      .set({ "User-Agent": GH_USERAGENT });

    if (userData.status !== 200) {
      logger.generic(2, "User Data Request to GitHub Failed!", {
        type: "object",
        obj: userData,
      });
      await common.handleError(req, res, {
        ok: false,
        short: "Server Error",
        content: userData,
      });
      return;
    }

    // Now to build a valid user object
    const username = userData.body.login;
    const userId = userData.body.node_id;
    const userAvatar = userData.body.avatar_url;

    const userExists = await database.getUserByNodeID(userId);

    if (userExists.ok) {
      logger.generic(4, `User Check Says User Exists: ${username}`);

      // If we plan to allow updating the user name or image, we would do so here

      // Now we redirect to the frontend site.
      res.redirect(`https://web.pulsar-edit.dev/users?token=${params.token}`);
      logger.httpLog(req, res);
      return;
    }

    let createdUser = await database.insertNewUser(username, userId, userAvatar);

    if (!createdUser.ok) {
      logger.generic(2, `Creating User Failed! ${username}`);
      await common.handleError(req, res, createdUser);
      return;
    }

    // Before returning, lets append their PAT token
    createdUser.content.token = params.token;

    res.redirect(
      `https://web.pulsar-edit.dev/users?token=${createdUser.content.token}`
    );
    logger.httpLog(req, res);
  } catch (err) {
    logger.generic(2, "/api/pat Caught an Error!", { type: "error", err: err });
    await common.handleError(req, res, err);
    return;
  }
}

module.exports = {
  getLogin,
  getOauth,
  getPat,
};

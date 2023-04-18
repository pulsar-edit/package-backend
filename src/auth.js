const database = require("./database.js");
const superagent = require("superagent");
const { GH_USERAGENT } = require("./config.js").getConfig();
const logger = require("./logger.js");

/**
 * @async
 * @function verifyAuth
 * @desc This will be the major function to determine, confirm, and provide user
 * details of an authenticated user. This will take a users provided token,
 * and use it to check GitHub for the details of whoever owns this token.
 * Once that is done, we can go ahead and search for said user within the database.
 * If the user exists, then we can confirm that they are both locally and globally
 * authenticated, and execute whatever action it is they wanted to.
 * @params {string} token - The token the user provided.
 * @returns {object} A server status object.
 */
async function verifyAuth(token) {
  if (token === null || token === undefined || token.length === 0) {
    logger.generic(
      5,
      "auth.verifyAuth() Returning 'Bad Auth' due to null|undefined token"
    );

    return {
      ok: false,
      short: "Bad Auth",
      content: "User Token not a valid format.",
    };
  }

  try {

    let userData = await superagent
      .get("https://api.github.com/user")
      .set({ Authorization: `Bearer ${token}` })
      .set({ "User-Agent": GH_USERAGENT })
      .ok((res) => res.status < 500); // Provide custom handler to define what
    // HTTP Status' are 'OK' since we need the handling on a 401 to inform of
    // invalid auth, which otherwise emits an error.

    if (userData.status !== 200) {
      logger.generic(
        3,
        `auth.verifyAuth() API Call returned: ${userData.status}`
      );
      switch (userData.status) {
        case 403:
        case 401:
          // When the user provides bad authentication, lets tell them it's bad auth.
          logger.generic(6, "auth.verifyAuth() API Call Returning Bad Auth");
          return { ok: false, short: "Bad Auth", content: userData };
          break;
        default:
          logger.generic(
            3,
            "auth.verifyAuth() API Call Returned Uncaught Status",
            { type: "object", obj: userData }
          );

          return { ok: false, short: "Server Error", content: userData };
      }
    }

    const provNodeId = userData.body.node_id;

    // Now we want to see if we are able to locate this user's node_id in our db.
    const dbUser = await database.getUserByNodeID(provNodeId);

    if (!dbUser.ok) {
      return dbUser;
    }

    // Now we have a valid user from the database, that we can confirm is fully authenticated.
    // We will go ahead and return an "Auth User Object" to let the rest of the system use

    const authUserObject = {
      token: token,
      id: dbUser.content.id,
      node_id: provNodeId,
      created_at: dbUser.content.created_at,
      username: dbUser.content.username,
      avatar: dbUser.content.avatar,
      data: dbUser.content.data,
    };

    logger.generic(
      4,
      `auth.verifyAuth() returning authenticated user: ${authUserObject.username}`
    );

    return {
      ok: true,
      content: authUserObject,
    };
  } catch (err) {
    logger.generic(3, "auth.verifyAuth() Caught an Error", {
      type: "error",
      err: err,
    });

    return {
      ok: false,
      short: "Server Error",
      content: "An unexpected Error occured while verifying your user.",
    };
  }
}

module.exports = {
  verifyAuth,
};

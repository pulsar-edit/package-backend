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
  if (token === null || token === undefined) {
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
    let userData = null;

    if (
      process.env.PULSAR_STATUS === "dev" &&
      process.env.MOCK_AUTH !== "false"
    ) {
      // Server is in developer mode.
      userData = getUserDataDevMode(token);
    } else {
      logger.generic(6, "auth.verifyAuth() Called in Production instance");
      userData = await superagent
        .get("https://api.github.com/user")
        .set({ Authorization: `Bearer ${token}` })
        .set({ "User-Agent": GH_USERAGENT })
        .ok((res) => res.status < 500); // Provide custom handler to define what
      // HTTP Status' are 'OK' since we need the handling on a 401 to inform of
      // invalid auth, which otherwise emits an error.
    }

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

/**
 * @function getUserDataDevMode
 * @desc An internal util to retrieve the user data object in developer mode only.
 * @params {string} token - The token the user provided.
 * @returns {object} A mocked HTTP return containing the minimum information required to mock the return expected from GitHub.
 */
function getUserDataDevMode(token) {
  logger.generic(3, "auth.verifyAuth() is returning Dev Only Permissions!");

  switch (token) {
    case "valid-token":
      return { status: 200, body: { node_id: "dever-nodeid" } };
    case "no-valid-token":
      return { status: 200, body: { node_id: "no-perm-user-nodeid" } };
    case "admin-token":
      return { status: 200, body: { node_id: "admin-user-nodeid" } };
    case "no-star-token":
      return { status: 200, body: { node_id: "has-no-stars-nodeid" } };
    case "all-star-token":
      return {
        status: 200,
        body: { node_id: "has-all-stars-nodeid" },
      };
    default:
      logger.generic(3, "No Valid dev user found!");
      return {
        status: 401,
        body: { message: "No Valid dev user found!" },
      };
  }
}

module.exports = {
  verifyAuth,
};

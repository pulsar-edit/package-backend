/**
 * @async
 * @function getUserCollectionById
 * @description Returns an array of Users and their associated data via the ids.
 * @param {array} ids - The IDs of users to collect the data of.
 * @returns {object} A server status object with the array of users collected.
 */

const getUserByID = require("./getUserByID.js").exec;
const logger = require("../logger.js");

module.exports = {
  safe: false,
  exec: async (sql, ids) => {
    let userArray = [];

    for (let i = 0; i < ids.length; i++) {
      let user = await getUserByID(sql, ids[i]);

      if (!user.ok) {
        logger.generic(3, "Unable to find user id: ", {
          type: "object",
          obj: ids[i],
        });
        logger.generic(3, "Details on Not Found User: ", {
          type: "object",
          obj: user,
        });
        continue;
      }

      userArray.push({ login: user.content.username });
    }

    return { ok: true, content: userArray };
  }
};

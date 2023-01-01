/**
 * @module update_handler
 * @desc Endpoint Handlers relating to updating the editor.
 * @implments {command_handler}
 */

const common = require("./common_handler.js");

/**
 * @async
 * @function getUpdates
 * @desc Used to retrieve new editor update information.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @property {http_method} - GET
 * @property {http_endpoint} - /api/updates
 * @todo This function has never been implemented on this system. Since there is currently no
 * update methodology.
 */
async function getUpdates(req, res) {
  await common.notSupported(req, res);
}

module.exports = {
  getUpdates,
};

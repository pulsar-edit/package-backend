/**
 * @module common_handler
 * @desc Provides a simplistic way to refer to implement common endpoint returns.
 * So these can be called as an async function without more complex functions, reducing
 * verbosity, and duplication within the codebase.
 * @implements {logger}
 */

const logger = require("../logger.js");

/**
 * @async
 * @function handleError
 * @desc Generic error handler mostly used to reduce the duplication of error handling in other modules.
 * It checks the short error string and calls the relative endpoint.
 * Note that it's designed to be called as the last async function before the return.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @param {object} obj - the Raw Status Object of the User, expected to return from `VerifyAuth`.
 */
async function handleError(req, res, obj, num) {
  switch (obj.short) {
    case "Not Found":
      await notFound(req, res);
      break;

    case "Bad Repo":
      await badRepoJSON(req, res, num);
      break;

    case "Bad Package":
      await badPackageJSON(req, res, num);
      break;

    case "No Repo Access":
    case "Bad Auth":
      await authFail(req, res, obj, num);
      break;

    case "File Not Found":
    case "Server Error":
    default:
      await serverError(req, res, obj.content, num);
      break;
  }
}

/**
 * @async
 * @function handleDetailedError
 * @desc Less generic error handler than `handleError()`. Used for returned the
 * improved error messages to users. Where instead of only returning an error
 * `message` it will return `message` and `details`. Providing better insight into
 * what has gone wrong with the server.
 * Additionally this will aim to simplify error handling by not handing off the
 * handling to additional functions.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @param {object} obj - The Object provided to return the error message.
 * @param {string} obj.short - The recognized Short Code string for error handling.
 * @param {string} obj.content - The detailed user friendly content of what's gone wrong.
 */
async function handleDetailedError(req, res, obj) {
  switch (obj.short) {
    case "Not Found":
      res.status(404).json({
        message: "Not Found",
        details: obj.content,
      });
      logger.httpLog(req, res);
      break;
    case "Bad Repo":
      res.status(400).json({
        message:
          "That repo does not exist, isn't a Pulsar package, or pulsarbot does not have access.",
        details: obj.content,
      });
      logger.httpLog(req, res);
      break;
    case "Bad Package":
      res.status(400).json({
        message: "The package.json at owner/repo isn't valid.",
        details: obj.content,
      });
      logger.httpLog(req, res);
      break;
    case "No Repo Access":
    case "Bad Auth":
      res.status(401).json({
        message:
          "Requires authentication. Please update your token if you haven't done so recently.",
        details: obj.content,
      });
      logger.httpLog(req, res);
      break;
    case "File Not Found":
    case "Server Error":
    default:
      res.status(500).json({
        message: "Application Error",
        details: obj.content,
      });
      logger.httpLog(req, res);
      break;
  }
  return;
}

/**
 * @async
 * @function authFail
 * @desc Will take the <b>failed</b> user object from VerifyAuth, and respond for the endpoint as
 * either a "Server Error" or a "Bad Auth", whichever is correct based on the Error bubbled from VerifyAuth.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @param {object} user - The Raw Status Object of the User, expected to return from `VerifyAuth`.
 * @implements {MissingAuthJSON}
 * @implements {ServerErrorJSON}
 * @implements {logger.HTTPLog}
 */
async function authFail(req, res, user, num) {
  switch (user.short) {
    case "Bad Auth":
    case "Auth Fail":
    case "No Repo Access": // support for being passed a git return.
      await missingAuthJSON(req, res);
      break;
    default:
      await serverError(req, res, user.content, num);
      break;
  }
}

/**
 * @async
 * @function serverError
 * @desc Returns a standard Server Error to the user as JSON. Logging the detailed error message to the server.
 * ###### Setting:
 * * Status Code: 500
 * * JSON Response Body: message: "Application Error"
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @param {string} err - The detailed error message to log server side.
 * @implements {logger.HTTPLog}
 * @implements {logger.generic}
 */
async function serverError(req, res, err, num) {
  res.status(500).json({ message: "Application Error" });
  logger.httpLog(req, res);
  logger.generic(3, "Returning Server Error in common", {
    type: "http",
    req: req,
    res: res,
  });
}

/**
 * @async
 * @function notFound
 * @desc Standard endpoint to return the JSON Not Found error to the user.
 * ###### Setting:
 * * Status Code: 404
 * * JSON Respone Body: message: "Not Found"
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {logger.HTTPLog}
 */
async function notFound(req, res) {
  res.status(404).json({ message: "Not Found" });
  logger.httpLog(req, res);
}

/**
 * @async
 * @function notSupported
 * @desc Returns a Not Supported message to the user.
 * ###### Setting:
 * * Status Code: 501
 * * JSON Response Body: message: "While under development this feature is not supported."
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {logger.HTTPLog}
 */
async function notSupported(req, res) {
  const message = "While under development this feature is not supported.";
  res.status(501).json({ message });
  logger.httpLog(req, res);
}

/**
 * @async
 * @function siteWideNotFound
 * @desc Returns the SiteWide 404 page to the end user.
 * ###### Setting Currently:
 * * Status Code: 404
 * * JSON Response Body: message: "This is a standin for the proper site wide 404 page."
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {logger.HTTPLog}
 */
async function siteWideNotFound(req, res) {
  res
    .status(404)
    .json({ message: "This is a standin for the proper site wide 404 page." });
  logger.httpLog(req, res);
}

/**
 * @async
 * @function badRepoJSON
 * @desc Returns the BadRepoJSON message to the user.
 * ###### Setting:
 * * Status Code: 400
 * * JSON Response Body: message: That repo does not exist, isn't an atom package, or atombot does not have access.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {logger.HTTPLog}
 */
async function badRepoJSON(req, res, num) {
  const message =
    "That repo does not exist, isn't an atom package, or atombot does not have access.";
  res.status(400).json({ message });
  logger.httpLog(req, res);
}

/**
 * @async
 * @function badPackageJSON
 * @desc Returns the BadPackageJSON message to the user.
 * ###### Setting:
 * * Status Code: 400
 * * JSON Response Body: message: The package.json at owner/repo isn't valid.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {logger.HTTPLog}
 */
async function badPackageJSON(req, res, num) {
  const message = "The package.json at owner/repo isn't valid.";
  res.status(400).json({ message });
  logger.httpLog(req, res);
}

/**
 * @function packageExists
 * @desc Returns the PackageExist message to the user.
 * ###### Setting:
 * * Status Code: 409
 * * JSON Response Body: message: "A Package by that name already exists."
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {logger.HTTPLog}
 */
async function packageExists(req, res) {
  res.status(409).json({ message: "A Package by that name already exists." });
  logger.httpLog(req, res);
}

/**
 * @function missingAuthJSON
 * @desc Returns the MissingAuth message to the user.
 * ###### Setting:
 * * Status Code: 401
 * * JSON Response Body: message: "Requires authentication. Please update your token if you haven't done so recently."
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {object} res - The `Response` object inherited from the Express endpoint.
 * @implements {logger.HTTPLog}
 */
async function missingAuthJSON(req, res) {
  const message =
    "Requires authentication. Please update your token if you haven't done so recently.";
  res.status(401).json({ message });
  logger.httpLog(req, res);
}

module.exports = {
  authFail,
  badRepoJSON,
  badPackageJSON,
  handleError,
  notFound,
  notSupported,
  packageExists,
  serverError,
  siteWideNotFound,
  handleDetailedError,
};

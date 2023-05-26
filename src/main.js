/**
 * @module main
 * @desc The Main functionality for the entire server. Sets up the Express server, providing
 * all endpoints it listens on. With those endpoints being further documented in `api.md`.
 */

const express = require("express");
const app = express();

const update_handler = require("./handlers/update_handler.js");
const star_handler = require("./handlers/star_handler.js");
const user_handler = require("./handlers/user_handler.js");
const theme_handler = require("./handlers/theme_handler.js");
const package_handler = require("./handlers/package_handler.js");
const common_handler = require("./handlers/common_handler.js");
const oauth_handler = require("./handlers/oauth_handler.js");
const webhook = require("./webhook.js");
const database = require("./database.js");
const auth = require("./auth.js");
const server_version = require("../package.json").version;
const logger = require("./logger.js");
const query = require("./query.js");
const vcs = require("./vcs.js");
const rateLimit = require("express-rate-limit");
const { MemoryStore } = require("express-rate-limit");
const { RATE_LIMIT_AUTH, RATE_LIMIT_GENERIC } =
  require("./config.js").getConfig();

// Define our Basic Rate Limiters
const genericLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.PULSAR_STATUS === "dev" ? 0 : RATE_LIMIT_GENERIC, // Limit each IP per window, 0 disables rate limit.
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: true, // Legacy rate limit info in headers
  store: new MemoryStore(), // Use default memory store
  message: "Too many requests, please try again later.", // Message once limit is reached.
  statusCode: 429, // HTTP Status Code once limit is reached.
  handler: (request, response, next, options) => {
    response.status(options.statusCode).json({ message: options.message });
    logger.httpLog(request, response);
  },
});

const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.PULSAR_STATUS === "dev" ? 0 : RATE_LIMIT_AUTH, // Limit each IP per window, 0 disables rate limit.
  standardHeaders: true, // Return rate limit info on headers
  legacyHeaders: true, // Legacy rate limit info in headers
  store: new MemoryStore(), // use default memory store
  message: "Too many requests, please try again later.", // message once limit is reached
  statusCode: 429, // HTTP Status code once limit is reached.
  handler: (request, response, next, options) => {
    response.status(options.statusCode).json({ message: options.message });
    logger.httpLog(request, response);
  },
});

// ^^ Our two Rate Limiters ^^ these are essentially currently disabled.
// The reason being, the original API spec made no mention of rate limiting, so nor will we.
// But once we have surpassed feature parity, we will instead enable these limits, to help
// prevent overusage of the api server. With Auth having a lower limit, then non-authed requests.

app.set("trust proxy", true);
// ^^^ Used to determine the true IP address behind the Google App Engine Load Balancer.
// This is need for the Authentication features to proper maintain their StateStore
// Hashmap. https://cloud.google.com/appengine/docs/flexible/nodejs/runtime#https_and_forwarding_proxies

app.use("/swagger-ui", express.static("docs/swagger"));

app.use((req, res, next) => {
  // This adds a start to the request, logging the exact time a request was received.
  req.start = Date.now();
  next();
});

/**
 * @web
 * @ignore
 * @path /
 * @desc A non-essential endpoint, returning a status message, and the server version.
 * @method GET
 * @auth FALSE
 */
app.get("/", genericLimit, (req, res) => {
  // While originally here in case this became the endpoint to host the
  // frontend website, now that that is no longer planned, it can be used
  // as a way to check the version of the server. Not needed, but may become helpful.
  res.status(200).send(`
      <p>Server is up and running Version ${server_version}</p><br>
      <a href="/swagger-ui">Swagger UI</a><br>
      <a href="https://github.com/pulsar-edit/package-backend/tree/main/docs" target="_blank">Documentation</a>
    `);
});

app.options("/", genericLimit, async (req, res) => {
  res.header({
    Allow: "GET",
    "X-Content-Type-Options": "nosniff",
  });
  res.sendStatus(204);
});

/**
 * @web
 * @ignore
 * @path /api/oauth
 * @desc OAuth Callback URL. Other details TBD.
 * @method GET
 * @auth FALSE
 */
app.get("/api/login", authLimit, async (req, res) => {
  await oauth_handler.getLogin(req, res);
});

app.options("/api/login", genericLimit, async (req, res) => {
  res.header({
    Allow: "GET",
    "X-Content-Type-Options": "nosniff",
  });
  res.sendStatus(204);
});

/**
 * @web
 * @ignore
 * @path /api/oauth
 * @desc OAuth Callback URL. Other details TDB.
 * @method GET
 * @auth FALSE
 */
app.get("/api/oauth", authLimit, async (req, res) => {
  await oauth_handler.getOauth(req, res);
});

app.options("/api/oauth", genericLimit, async (req, res) => {
  res.header({
    Allow: "GET",
    "X-Content-Type-Options": "nosniff",
  });
  res.sendStatus(204);
});

/**
 * @web
 * @ignore
 * @path /api/pat
 * @desc Pat Token Signup URL.
 * @method GET
 * @auth FALSE
 */
app.get("/api/pat", authLimit, async (req, res) => {
  await oauth_handler.getPat(req, res);
});

app.options("/api/pat", genericLimit, async (req, res) => {
  res.header({
    Allow: "GET",
    "X-Content-Type-Options": "nosniff",
  });
  res.sendStatus(204);
});

/**
 * @web
 * @ignore
 * @path /api/:packType
 * @desc List all packages.
 * @method GET
 * @auth false
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *   @name page
 *   @location query
 *   @Ptype integer
 *   @default 1
 *   @required false
 *   @Pdesc Indicate the page number to return.
 * @param
 *   @name sort
 *   @Ptype string
 *   @location query
 *   @default downloads
 *   @valid downloads, created_at, updated_at, stars
 *   @required false
 *   @Pdesc The method to sort the returned pacakges by.
 * @param
 *   @name direction
 *   @Ptype string
 *   @default desc
 *   @valid desc, asc
 *   @required false
 *   @Pdesc Which direction to list the results. If sorting by stars, can only be sorted by desc.
 * @param
 *  @name service
 *  @Ptype string
 *  @required false
 *  @Pdesc A service to filter results by.
 * @param
 *  @name serviceType
 *  @Ptype string
 *  @required false
 *  @valid provided, consumed
 *  @Pdesc The service type to filter results by. Must be supplied if a service is provided.
 * @param
 *  @name serviceVersion
 *  @Ptype string
 *  @required false
 *  @Pdesc An optional (when providing a service) version to filter results by.
 * @response
 *   @status 200
 *   @Rtype application/json
 *   @Rdesc Returns a list of all packages. Paginated 30 at a time. Links to the next and last pages are in the 'Link' Header.
 */
app.get("/api/:packType", genericLimit, async (req, res, next) => {
  switch (req.params.packType) {
    case "packages": {
      let ret = await package_handler.getPackages(
        {
          page: query.page(req),
          sort: query.sort(req),
          direction: query.dir(req),
          serviceType: query.serviceType(req),
          service: query.service(req),
          serviceVersion: query.serviceVersion(req),
        },
        database
      );

      if (!ret.ok) {
        await common_handler.handleError(req, res, ret.content);
        return;
      }

      // Since we know this is a paginated endpoint we will handle that here
      res.append("Link", ret.link);
      res.append("Query-Total", ret.total);
      res.append("Query-Limit", ret.limit);

      res.status(200).json(ret.content);
      logger.httpLog(req, res);

      break;
    }
    case "themes": {
      let ret = await theme_handler.getThemes(
        {
          page: query.page(req),
          sort: query.sort(req),
          direction: query.dir(req),
        },
        database
      );

      if (!ret.ok) {
        await common_handler.handleError(req, res, ret.content);
        return;
      }

      // Since we know this is a paginated endpoint we will handle that here
      res.append("Link", ret.link);
      res.append("Query-Total", ret.total);
      res.append("Query-Limit", ret.limit);

      res.status(200).json(ret.content);
      logger.httpLog(req, res);

      break;
    }
    default: {
      next();
      break;
    }
  }
});

/**
 * @web
 * @ignore
 * @path /api/packages
 * @desc Publishes a new Package.
 * @method POST
 * @auth true
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *   @name repository
 *   @Ptype string
 *   @location query
 *   @required true
 *   @Pdesc The repository containing the plugin, in the form 'owner/repo'.
 * @param
 *   @name Authentication
 *   @Ptype string
 *   @location header
 *   @required true
 *   @Pdesc A valid Atom.io token, in the 'Authorization' Header.
 * @response
 *   @status 201
 *   @Rtype application/json
 *   @Rdesc Successfully created, return created package.
 * @response
 *   @status 400
 *   @Rtype application/json
 *   @Rdesc Repository is inaccessible, nonexistant, not an atom package. Could be different errors returned.
 *   @Rexample { "message": "That repo does not exist, ins't an atom package, or atombot does not have access." }, { "message": "The package.json at owner/repo isn't valid." }
 * @response
 *   @status 409
 *   @Rtype application/json
 *   @Rdesc A package by that name already exists.
 */
app.post("/api/:packType", authLimit, async (req, res, next) => {
  switch (req.params.packType) {
    case "packages":
    case "themes":
      const params = {
        repository: query.repo(req),
        auth: query.auth(req),
      };

      let ret = await package_handler.postPackages(params, database, auth, vcs);

      if (!ret.ok) {
        if (ret.type === "detailed") {
          await common_handler.handleDetailedError(req, res, ret.content);
          return;
        } else {
          await common_handler.handleError(req, res, ret.content);
          return;
        }
      }

      res.status(201).json(ret.content);

      // Return to user before webhook call, so user doesn't wait on it
      await webhook.alertPublishPackage(ret.webhook.pack, ret.webhook.user);

      break;
    default:
      next();
      break;
  }
});

app.options("/api/:packType", genericLimit, async (req, res, next) => {
  switch (req.params.packType) {
    case "packages":
    case "themes":
      res.header({
        Allow: "POST, GET",
        "X-Content-Type-Options": "nosniff",
      });
      res.sendStatus(204);
      break;
    default:
      next();
      break;
  }
});

/**
 * @web
 * @ignore
 * @path /api/:packType/featured
 * @desc Previously Undocumented endpoint. Used to return featured packages from all existing packages.
 * @method GET
 * @auth false
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @valid packages, themes
 *   @required true
 *   @Pdesc The Package Type you want to request.
 * @response
 *   @status 200
 *   @Rdesc An array of packages similar to /api/packages endpoint.
 */
app.get("/api/:packType/featured", genericLimit, async (req, res, next) => {
  switch (req.params.packType) {
    case "packages": {
      let ret = await package_handler.getPackagesFeatured(database);

      if (!ret.ok) {
        await common_handler.handleError(req, res, ret.content);
        return;
      }

      res.status(200).json(ret.content);
      logger.httpLog(req, res);
      break;
    }
    case "themes": {
      let ret = await theme_handler.getThemeFeatured(database);

      if (!ret.ok) {
        await common_handler.handleError(req, res, ret.content);
        return;
      }

      res.status(200).json(ret.content);
      logger.httpLog(req, res);
      break;
    }
    default: {
      next();
      break;
    }
  }
});

app.options("/api/:packType/featured", genericLimit, async (req, res, next) => {
  switch (req.params.packType) {
    case "packages":
    case "themes":
      res.header({
        Allow: "GET",
        "X-Content-Type-Options": "nosniff",
      });
      res.sendStatus(204);
      break;
    default:
      next();
      break;
  }
});

/**
 * @web
 * @ignore
 * @path /api/:packType/search
 * @desc Searches all Packages.
 * @method GET
 * @auth false
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @valid packages, themes
 *   @Pdesc The Package Type you want.
 * @param
 *   @name q
 *   @Ptype string
 *   @required true
 *   @location query
 *   @Pdesc Search query.
 * @param
 *   @name page
 *   @Ptype integer
 *   @required false
 *   @location query
 *   @Pdesc The page of search results to return.
 * @param
 *   @name sort
 *   @Ptype string
 *   @required false
 *   @valid downloads, created_at, updated_at, stars
 *   @default relevance
 *   @location query
 *   @Pdesc Method to sort the results.
 * @param
 *   @name direction
 *   @Ptype string
 *   @required false
 *   @valid asc, desc
 *   @default desc
 *   @location query
 *   @Pdesc Direction to list search results.
 * @response
 *   @status 200
 *   @Rtype application/json
 *   @Rdesc Same format as listing packages, additionally paginated at 30 items.
 */
app.get("/api/:packType/search", genericLimit, async (req, res, next) => {
  switch (req.params.packType) {
    case "packages": {
      let ret = await package_handler.getPackagesSearch(
        {
          sort: query.sort(req),
          page: query.page(req),
          direction: query.dir(req),
          query: query.query(req),
        },
        database
      );

      if (!ret.ok) {
        await common_handler.handleError(req, res, ret.content);
        return;
      }

      // Since we know this is a paginated endpoint we must handle that here
      res.append("Link", ret.link);
      res.append("Query-Total", ret.total);
      res.append("Query-Limit", ret.limit);

      res.status(200).json(ret.content);
      logger.httpLog(req, res);
      break;
    }
    case "themes": {
      const params = {
        sort: query.sort(req),
        page: query.page(req),
        direction: query.dir(req),
        query: query.query(req),
      };

      let ret = await theme_handler.getThemesSearch(params, database);

      if (!ret.ok) {
        await common_handler.handleError(req, res, ret.content);
        return;
      }

      // Since we know this is a paginated endpoint we must handle that here
      res.append("Link", ret.link);
      res.append("Query-Total", ret.total);
      res.append("Query-Limit", ret.limit);

      res.status(200).json(ret.content);
      logger.httpLog(req, res);
      break;
    }
    default: {
      next();
      break;
    }
  }
});

app.options("/api/:packType/search", genericLimit, async (req, res, next) => {
  switch (req.params.packType) {
    case "packages":
    case "themes":
      res.header({
        Allow: "GET",
        "X-Content-Type-Options": "nosniff",
      });
      res.sendStatus(204);
      break;
    default:
      next();
      break;
  }
});

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName
 * @desc Show package details.
 * @method GET
 * @auth false
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *   @name packageName
 *   @location path
 *   @Ptype string
 *   @Pdesc The name of the package to return details for. URL escaped.
 *   @required true
 * @param
 *   @name engine
 *   @location query
 *   @Ptype string
 *   @Pdesc Only show packages compatible with this Atom version. Must be valid SemVer.
 *   @required false
 * @response
 *   @status 200
 *   @Rtype application/json
 *   @Rdesc Returns package details and versions for a single package.
 */
app.get("/api/:packType/:packageName", genericLimit, async (req, res, next) => {
  switch (req.params.packType) {
    case "packages":
    case "themes":
      // We can use the same handler here because the logic of the return
      // Will be identical no matter what type of package it is.
      const params = {
        engine: query.engine(req.query.engine),
        name: query.packageName(req),
      };

      let ret = await package_handler.getPackagesDetails(params, database);

      if (!ret.ok) {
        await common_handler.handleError(req, res, ret.content);
        return;
      }

      res.status(200).json(ret.content);
      logger.httpLog(req, res);
      break;
    default:
      next();
      break;
  }
});

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName
 * @method DELETE
 * @auth true
 * @desc Delete a package.
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *   @name packageName
 *   @location path
 *   @Ptype string
 *   @Pdesc The name of the package to delete.
 *   @required true
 * @param
 *   @name Authorization
 *   @location header
 *   @Ptype string
 *   @Pdesc A valid Atom.io token, in the 'Authorization' Header.
 *   @required true
 * @response
 *   @status 204
 *   @Rtype application/json
 *   @Rdesc Successfully deleted package. Returns No Content.
 * @response
 *   @status 400
 *   @Rtype application/json
 *   @Rdesc Repository is inaccessible.
 *   @Rexample { "message": "Respository is inaccessible." }
 * @response
 *   @status 401
 *   @Rtype application/json
 *   @Rdesc Unauthorized.
 */
app.delete("/api/:packType/:packageName", authLimit, async (req, res, next) => {
  switch (req.params.packType) {
    case "packages":
    case "themes":
      const params = {
        auth: query.auth(req),
        packageName: query.packageName(req),
      };

      let ret = await package_handler.deletePackagesName(
        params,
        database,
        auth,
        vcs
      );

      if (!ret.ok) {
        await common_handler.handleError(req, res, ret.content);
        return;
      }

      // We know on success we should just return a statuscode
      res.status(204).send();
      logger.httpLog(req, res);

      break;
    default:
      next();
      break;
  }
});

app.options(
  "/api/:packType/:packageName",
  genericLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        res.header({
          Allow: "DELETE, GET",
          "X-Content-Type-Options": "nosniff",
        });
        res.sendStatus(204);
        break;
      default:
        next();
        break;
    }
  }
);

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/star
 * @method POST
 * @auth true
 * @desc Star a package.
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *    @name packageName
 *    @location path
 *    @Ptype string
 *    @Pdesc The name of the package to star.
 *    @required true
 * @param
 *    @name Authorization
 *    @location header
 *    @Ptype string
 *    @Pdesc A valid Atom.io token, in the 'Authorization' Header
 *    @required true
 * @response
 *    @status 200
 *    @Rtype application/json
 *    @Rdesc Returns the package that was stared.
 */
app.post(
  "/api/:packType/:packageName/star",
  authLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        const params = {
          auth: query.auth(req),
          packageName: query.packageName(req),
        };

        let ret = await package_handler.postPackagesStar(
          params,
          database,
          auth
        );

        if (!ret.ok) {
          await common_handler.handleError(req, res, ret.content);
          return;
        }

        res.status(200).json(ret.content);
        logger.httpLog(req, res);
        break;
      default:
        next();
        break;
    }
  }
);

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/star
 * @method DELETE
 * @auth true
 * @desc Unstar a package, requires authentication.
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *  @location header
 *  @Ptype string
 *  @name Authentication
 *  @required true
 *  @Pdesc Atom Token, in the Header Authentication Item
 * @param
 *  @location path
 *  @Ptype string
 *  @name packageName
 *  @required true
 *  @Pdesc The package name to unstar.
 * @response
 *  @status 201
 *  @Rdesc An empty response to convey successfully unstaring a package.
 */
app.delete(
  "/api/:packType/:packageName/star",
  authLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        const params = {
          auth: query.auth(req),
          packageName: query.packageName(req),
        };

        let ret = await package_handler.deletePackagesStar(
          params,
          database,
          auth
        );

        if (!ret.ok) {
          await common_handler.handleError(req, res, ret.content);
          return;
        }

        // On success we just return status code
        res.status(201).send();
        logger.httpLog(req, res);

        break;
      default:
        next();
        break;
    }
  }
);

app.options(
  "/api/:packType/:packageName/star",
  genericLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        res.header({
          Allow: "DELETE, POST",
          "X-Content-Type-Options": "nosniff",
        });
        res.sendStatus(204);
        break;
      default:
        next();
        break;
    }
  }
);

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/stargazers
 * @method GET
 * @desc List the users that have starred a package.
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *  @location path
 *  @required true
 *  @name packageName
 *  @Pdesc The package name to check for users stars.
 * @response
 *  @status 200
 *  @Rdesc A list of user Objects.
 *  @Rexample [ { "login": "aperson" }, { "login": "anotherperson" } ]
 */
app.get(
  "/api/:packType/:packageName/stargazers",
  genericLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        const params = {
          packageName: query.packageName(req),
        };
        let ret = await package_handler.getPackagesStargazers(params, database);

        if (!ret.ok) {
          await common_handler.handleError(req, res, ret.content);
          return;
        }

        res.status(200).json(ret.content);
        logger.httpLog(req, res);
        break;
      default:
        next();
        break;
    }
  }
);

app.options(
  "/api/:packType/:packageName/stargazers",
  genericLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        res.header({
          Allow: "GET",
          "X-Content-Type-Options": "nosniff",
        });
        res.sendStatus(204);
        break;
      default:
        next();
        break;
    }
  }
);

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/versions
 * @auth true
 * @method POST
 * @desc Creates a new package version. If `rename` is not `true`, the `name` field in `package.json` _must_ match the current package name.
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *  @location path
 *  @name packageName
 *  @required true
 *  @Pdesc The Package to modify.
 * @param
 *  @location query
 *  @name rename
 *  @required false
 *  @Pdesc Boolean indicating whether this version contains a new name for the package.
 * @param
 *  @location header
 *  @name auth
 *  @required true
 *  @Pdesc A valid Atom.io API token, to authenticate with Github.
 * @response
 *  @status 201
 *  @Rdesc Successfully created. Returns created version.
 * @response
 *  @status 400
 *  @Rdesc Git tag not found / Repository inaccessible / package.json invalid.
 */
app.post(
  "/api/:packType/:packageName/versions",
  authLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        const params = {
          rename: query.rename(req),
          auth: query.auth(req),
          packageName: query.packageName(req),
        };

        let ret = await package_handler.postPackagesVersion(
          params,
          database,
          auth,
          vcs
        );

        if (!ret.ok) {
          if (ret.type === "detailed") {
            await common_handler.handleDetailedError(req, res, ret.content);
            return;
          } else {
            await common_handler.handleError(req, res, ret.content);
            return;
          }
        }

        res.status(201).json(ret.content);

        // Return to user before webhook call, so user doesn't wait on it
        await webhook.alertPublishVersion(ret.webhook.pack, ret.webhook.user);
        // Now to call for feature detection
        let features = await vcs.featureDetection(
          ret.featureDetection.user,
          ret.featureDetection.ownerRepo,
          ret.featureDetection.service
        );

        if (!features.ok) {
          logger.generic(3, features);
          return;
        }

        // Then we know we don't need to apply any special features for a standard
        // package, so we will check that early
        if (features.content.standard) {
          return;
        }

        let featureApply = await database.applyFeatures(features.content, ret.webhook.pack.name, ret.webhook.pack.version);

        if (!featureApply.ok) {
          logger.generic(3, featureApply);
          return;
        }

        // Otherwise we have completed successfully.
        // We could log this, but will just return
        return;
        break;
      default:
        next();
        break;
    }
  }
);

app.options(
  "/api/:packType/:packageName/versions",
  genericLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        res.header({
          Allow: "POST",
          "X-Content-Type-Options": "nosniff",
        });
        res.sendStatus(204);
        break;
      default:
        next();
        break;
    }
  }
);

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/versions/:versionName
 * @method GET
 * @auth false
 * @desc Returns `package.json` with `dist` key added for tarball download.
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *  @location path
 *  @name packageName
 *  @required true
 *  @Pdesc The package name we want to access
 * @param
 *  @location path
 *  @name versionName
 *  @required true
 *  @Pdesc The Version we want to access.
 * @response
 *  @status 200
 *  @Rdesc The `package.json` modified as explainged in the endpoint description.
 */
app.get(
  "/api/:packType/:packageName/versions/:versionName",
  genericLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        const params = {
          packageName: query.packageName(req),
          versionName: query.engine(req.params.versionName),
        };

        let ret = await package_handler.getPackagesVersion(params, database);

        if (!ret.ok) {
          await common_handler.handleError(req, res, ret.content);
          return;
        }

        res.status(200).json(ret.content);
        logger.httpLog(req, res);
        break;
      default:
        next();
        break;
    }
  }
);

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/versions/:versionName
 * @method DELETE
 * @auth true
 * @desc Deletes a package version. Note once a version is deleted, that same version should not be reused again.
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *  @location header
 *  @name Authentication
 *  @required true
 *  @Pdesc The Authentication header containing a valid Atom Token
 * @param
 *  @location path
 *  @name packageName
 *  @required true
 *  @Pdesc The package name to check for the version to delete.
 * @param
 *  @location path
 *  @name versionName
 *  @required true
 *  @Pdesc The Package Version to actually delete.
 * @response
 *  @status 204
 *  @Rdesc Indicates a successful deletion.
 */
app.delete(
  "/api/:packType/:packageName/versions/:versionName",
  authLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        const params = {
          auth: query.auth(req),
          packageName: query.packageName(req),
          versionName: query.engine(req.params.versionName),
        };

        let ret = await package_handler.deletePackageVersion(
          params,
          database,
          auth,
          vcs
        );

        if (!ret.ok) {
          await common_handler.handleError(req, res, ret.content);
          return;
        }

        // This is, on success, and empty return
        res.status(204).send();
        logger.httpLog(req, res);

        break;
      default:
        next();
        break;
    }
  }
);

app.options(
  "/api/:packType/:packageName/versions/:versionName",
  genericLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        res.header({
          Allow: "GET, DELETE",
          "X-Content-Type-Options": "nosniff",
        });
        res.sendStatus(204);
        break;
      default:
        next();
        break;
    }
  }
);

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/versions/:versionName/tarball
 * @method GET
 * @auth false
 * @desc Previously undocumented endpoint. Seems to allow for installation of a package. This is not currently implemented.
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *   @location path
 *   @name packageName
 *   @required true
 *   @Pdesc The package we want to download.
 * @param
 *   @location path
 *   @name versionName
 *   @required true
 *   @Pdesc The package version we want to download.
 * @response
 *   @status 200
 *   @Rdesc The tarball data for the user to then be able to install.
 */
app.get(
  "/api/:packType/:packageName/versions/:versionName/tarball",
  genericLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        const params = {
          packageName: query.packageName(req),
          versionName: query.engine(req.params.versionName),
        };

        let ret = await package_handler.getPackagesVersionTarball(
          params,
          database
        );

        if (!ret.ok) {
          await common_handler.handleError(req, res, ret.content);
          return;
        }

        // We know this endpoint, if successful will redirect, so that must be handled here
        res.redirect(ret.content);
        logger.httpLog(req, res);

        break;
      default:
        next();
        break;
    }
  }
);

app.options(
  "/api/:packType/:packageName/versions/:versionName/tarball",
  genericLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        res.header({
          Allow: "GET",
          "X-Content-Type-Options": "nosniff",
        });
        res.sendStatus(204);
        break;
      default:
        next();
        break;
    }
  }
);

/**
 * @web
 * @ignore
 * @path /api/packages/:packageName/versions/:versionName/events/uninstall
 * @desc Previously undocumented endpoint. BETA: Decreases the packages download count, by one. Indicating an uninstall.
 * v1.0.2 - Now has no effect. Being deprecated, but presents no change to end users.
 * @method POST
 * @auth true
 * @param
 *   @name packType
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The Package Type you want to request.
 *   @valid packages, themes
 * @param
 *   @name packageName
 *   @location path
 *   @required true
 *   @Pdesc The name of the package to modify.
 * @param
 *   @name versionName
 *   @location path
 *   @required true
 *   @Pdesc This value is within the original spec. But has no use in its current implementation.
 * @param
 *   @name auth
 *   @location header
 *   @required true
 *   @Pdesc Valid Atom.io token.
 * @response
 *   @status 200
 *   @Rdesc Returns JSON ok: true
 */
app.post(
  "/api/:packType/:packageName/versions/:versionName/events/uninstall",
  authLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        /**
          Used when a package is uninstalled, decreases the download count by 1.
          Originally an undocumented endpoint.
          The decision to return a '201' is based on how other POST endpoints return,
          during a successful event.
          This endpoint has now been deprecated, as it serves no useful features,
          and on further examination may have been intended as a way to collect
          data on users, which is not something we implement.
          * Deprecated since v1.0.2
          * see: https://github.com/atom/apm/blob/master/src/uninstall.coffee
          * While decoupling HTTP handling from logic, the function has been removed
            entirely: https://github.com/pulsar-edit/package-backend/pull/171
        */
        res.status(200).json({ ok: true });
        logger.httpLog(req, res);
        break;
      default:
        next();
        break;
    }
  }
);

app.options(
  "/api/:packType/:packageName/versions/:versionName/events/uninstall",
  genericLimit,
  async (req, res, next) => {
    switch (req.params.packType) {
      case "packages":
      case "themes":
        res.header({
          Allow: "POST",
          "X-Content-Type-Options": "nosniff",
        });
        res.sendStatus(204);
        break;
      default:
        next();
        break;
    }
  }
);

/**
 * @web
 * @ignore
 * @path /api/users/:login/stars
 * @method GET
 * @auth false
 * @desc List a user's starred packages.
 * @param
 *   @name login
 *   @Ptype string
 *   @required true
 *   @Pdesc The username of who to list their stars.
 * @response
 *   @status 200
 *   @Rdesc Return value is similar to GET /api/packages
 * @response
 *  @status 404
 *  @Rdesc If the login does not exist, a 404 is returned.
 */
app.get("/api/users/:login/stars", genericLimit, async (req, res) => {
  const params = {
    login: query.login(req),
  };

  let ret = await user_handler.getLoginStars(params, database);

  if (!ret.ok) {
    await common_handler.handleError(req, res, ret.content);
    return;
  }

  res.status(200).json(ret.content);
  logger.httpLog(req, res);
});

app.options("/api/users/:login/stars", genericLimit, async (req, res) => {
  res.header({
    Allow: "GET",
    "X-Content-Type-Options": "nosniff",
  });
  res.sendStatus(204);
});

/**
 * @web
 * @ignore
 * @path /api/users
 * @method GET
 * @desc Display details of the currently authenticated user.
 * This endpoint is undocumented and technically doesn't exist.
 * This is a strange endpoint that only exists on the Web version of the upstream
 * API. Having no equivalent on the backend. This is an inferred implementation.
 * @auth true
 * @param
 *   @name auth
 *   @location header
 *   @Ptype string
 *   @required true
 *   @Pdesc Authorization Header of valid User Account Token.
 * @response
 *   @status 200
 *   @Rdesc The return Details of the User Account.
 *   @Rtype application/json
 */
app.get("/api/users", authLimit, async (req, res) => {
  res.header("Access-Control-Allow-Methods", "GET");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Access-Control-Allow-Credentials"
  );
  res.header("Access-Control-Allow-Origin", "https://web.pulsar-edit.dev");
  res.header("Access-Control-Allow-Credentials", true);

  const params = {
    auth: query.auth(req),
  };

  let ret = await user_handler.getAuthUser(params, database, auth);

  if (!ret.ok) {
    await common_handler.handleError(req, res, ret.content);
    return;
  }

  // TODO: This was set within the function previously, needs to be determined if this is needed
  res.set({ "Access-Control-Allow-Credentials": true });

  res.status(200).json(ret.content);
  logger.httpLog(req, res);
});

app.options("/api/users", async (req, res) => {
  res.header({
    Allow: "GET",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Access-Control-Allow-Credentials",
    "Access-Control-Allow-Origin": "https://web.pulsar-edit.dev",
    "Access-Control-Allow-Credentials": true,
  });
  res.sendStatus(204);
});

/**
 * @web
 * @ignore
 * @path /api/users/:login
 * @method GET
 * @desc Display the details of any user, as well as the packages they have published.
 * @auth false
 * @param
 *   @name login
 *   @location path
 *   @Ptype string
 *   @required true
 *   @Pdesc The User of which to collect the details of.
 * @response
 *   @status 200
 *   @Rdesc The returned details of a specific user, along with the packages they have published.
 *   @Rtype application/json
 */
app.get("/api/users/:login", genericLimit, async (req, res) => {
  const params = {
    login: query.login(req),
  };

  let ret = await user_handler.getUser(params, database);

  if (!ret.ok) {
    await common_handler.handleError(req, res, ret.content);
    return;
  }

  res.status(200).json(ret.content);
  logger.httpLog(req, res);
});

app.options("/api/users/:login", genericLimit, async (req, res) => {
  res.header({
    Allow: "GET",
    "X-Content-Type-Options": "nosniff",
  });
  res.sendStatus(204);
});

/**
 * @web
 * @ignore
 * @path /api/stars
 * @method GET
 * @desc List the authenticated user's starred packages.
 * @auth true
 * @param
 *   @name auth
 *   @location header
 *   @Ptype string
 *   @required true
 *   @Pdesc Authorization Header of valid Atom.io Token.
 * @response
 *   @status 200
 *   @Rdesc Return value similar to GET /api/packages, an array of package objects.
 *   @Rtype application/json
 */
app.get("/api/stars", authLimit, async (req, res) => {
  const params = {
    auth: query.auth(req),
  };

  let ret = await star_handler.getStars(params, database, auth);

  if (!ret.ok) {
    await common_handler.handleError(req, res, ret.content);
    return;
  }

  res.status(200).json(ret.content);
  logger.httpLog(req, res);
});

app.options("/api/stars", genericLimit, async (req, res) => {
  res.header({
    Allow: "GET",
    "X-Content-Type-Options": "nosniff",
  });
  res.sendStatus(204);
});

/**
 * @web
 * @ignore
 * @path /api/updates
 * @method GET
 * @desc List Atom Updates.
 * @response
 *   @status 200
 *   @Rtype application/json
 *   @Rdesc Atom update feed, following the format expected by Squirrel.
 */
app.get("/api/updates", genericLimit, async (req, res) => {
  let ret = await update_handler.getUpdates();

  if (!ret.ok) {
    await common_handler.notSupported(req, res);
    return;
  }

  // TODO: There is no else until this endpoint is implemented.
});

app.options("/api/updates", genericLimit, async (req, res) => {
  res.header({
    Allow: "GET",
    "X-Content-Type-Options": "nosniff",
  });
  res.sendStatus(204);
});

app.use((req, res) => {
  // Having this as the last route, will handle all other unknown routes.
  // Ensure to leave this at the very last position to handle properly.
  common_handler.siteWideNotFound(req, res);
});

module.exports = app;

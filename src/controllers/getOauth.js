/**
 * @module getOauth
 */

const superagent = require("superagent");

module.exports = {
  docs: {
    summary: "OAuth Callback URL.",
    responses: {
      302: {
        description: "A redirect to the Pulsar Package Website User page."
      }
    }
  },
  endpoint: {
    method: "GET",
    paths: ["/api/oauth"],
    rateLimit: "auth",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
    endpointKind: "raw",
  },

  async logic(req, res, context) {
    let params = {
      state: req.query.state ?? "",
      code: req.query.code ?? "",
    };

    // First we want to ensure that the received state key is valid
    const validStateKey = await context.database.authCheckAndDeleteStateKey(
      params.state
    );

    if (!validStateKey.ok) {
      res.status(500).json({
        message: "Application Error: Invalid State Key provided.",
      });
      context.logger.httpLog(req, res);
      return;
    }

    // Retrieve access token
    const initialAuth = await superagent
      .post("https://github.com/login/oauth/access_token")
      .query({
        code: params.code,
        redirect_uri: context.config.GH_REDIRECTURI,
        client_id: context.config.GH_CLIENTID,
        client_secret: context.config.GH_CLIENTSECRET,
      });

    const accessToken = initialAuth.body?.access_token;

    if (accessToken === null || initialAuth.body?.token_type === null) {
      res.status(500).json({
        message: "Application Error: Authentication to GitHub failed.",
      });
      context.logger.httpLog(req, res);
      return;
    }

    try {
      // Request the user data using the access token
      const userData = await superagent
        .get("https://api.github.com/user")
        .set({ Authorization: `Bearer ${accessToken}` })
        .set({ "User-Agent": context.config.GH_USERAGENT });

      if (userData.status !== 200) {
        res.status(500).json({
          message: `Application Error: Received HTTP Status ${userData.status}`,
        });
        context.logger.httpLog(req, res);
        return;
      }

      // Now retrieve the user data that we need to store into the DB
      const username = userData.body.login;
      const userId = userData.body.node_id;
      const userAvatar = userData.body.avatar_url;

      const userExists = await context.database.getUserByNodeID(userId);

      if (userExists.ok) {
        // This means that the user does in fact already exist.
        // And from there they are likely reauthenticating,
        // But since we don't save any type of auth tokens, the user just needs
        // a new one and we should return their new one to them.

        // Now we redirect to the frontend site
        res.redirect(`https://web.pulsar-edit.dev/users?token=${accessToken}`);
        context.logger.httpLog(req, res);
        return;
      }

      // The user does not exist, so we save its data into the DB
      let createdUser = await context.database.insertNewUser(
        username,
        userId,
        userAvatar
      );

      if (!createdUser.ok) {
        res.status(500).json({
          message: "Application Error: Creating the user account failed!",
        });
        context.logger.httpLog(req, res);
        return;
      }

      // Before returning, lets append their access token
      createdUser.content.token = accessToken;

      // Now re redirect to the frontend site
      res.redirect(
        `https://web.pulsar-edit.dev/users?token=${createdUser.content.token}`
      );
      context.logger.httpLog(req, res);
      return;
    } catch (err) {
      context.logger.generic(2, "/api/oauth Caught an Error!", {
        type: "error",
        err: err,
      });
      res.status(500).json({
        message:
          "Application Error: The server encountered an error processing the request.",
      });
      context.logger.httpLog(req, res);
      return;
    }
  },
};

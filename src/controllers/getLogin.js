/**
 * @module getLogin
 */

module.exports = {
  docs: {
    summary: "OAuth callback URL.",
    responses: {
      302: {
        description: "A redirect to the GitHub OAuth Authorization login flow."
      }
    }
  },
  endpoint: {
    method: "GET",
    paths: ["/api/login"],
    rateLimit: "auth",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
    endpointKind: "raw",
  },

  async logic(req, res, context) {
    // The first point of contact to log into the app.
    // Since this will be the endpoint for a user to login, we need
    // to redirect to GH.
    // @see https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps

    // Generate a random key
    const stateKey = context.utils.generateRandomString(64);

    // Before redirect, save the key into the db
    const saveStateKey = await context.database.authStoreStateKey(stateKey);

    if (!saveStateKey.ok) {
      res.status(500).json({
        message: "Application Error: Failed to generate secure state key.",
      });
      context.logger.httpLog(req, res);
      return;
    }

    res
      .status(302)
      .redirect(
        `https://github.com/login/oauth/authorize?client_id=${context.config.GH_CLIENTID}&redirect_uri=${context.config.GH_REDIRECTURI}&state=${stateKey}&scope=public_repo%20read:org`
      );

    context.logger.httpLog(req, res);
    return;
  },
};

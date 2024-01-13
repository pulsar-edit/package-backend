/**
 * @module getPat
 */

const superagent = require("superagent");

module.exports = {
  docs: {
    summary: "PAT Token Signup URL.",
  },
  endpoint: {
    method: "GET",
    paths: ["/api/pat"],
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
      token: req.query.token ?? "",
    };

    if (params.token === "") {
      res.status(404).json({
        message: "Not Found: Parameter 'token' is empty.",
      });
      context.logger.httpLog(req, res);
      return;
    }

    try {
      const userData = await superagent
        .get("https://api.github.com/user")
        .set({ Authorization: `Bearer ${params.token}` })
        .set({ "User-Agent": context.config.GH_USERAGENT });

      if (userData.status !== 200) {
        context.logger.generic(2, "User Data request to GitHub failed!", {
          type: "object",
          obj: userData,
        });
        res.status(500).json({
          message: `Application Error: Received HTTP Status ${userData.status} when contacting GitHub!`,
        });
        context.logger.httpLog(req, res);
        return;
      }

      // Now to build a valid user object
      const username = userData.body.login;
      const userId = userData.body.node_id;
      const userAvatar = userData.body.avatar_url;

      const userExists = await context.database.getUserByNodeID(userId);

      if (userExists.ok) {
        // If we plan to allow updating the user name or image, we would do so here

        // Now to redirect to the frontend site.
        res.redirect(`https://web.pulsar-edit.dev/users?token=${params.token}`);
        context.logger.httpLog(req, res);
        return;
      }

      let createdUser = await context.database.insertNewUser(
        username,
        userId,
        userAvatar
      );

      if (!createdUser.ok) {
        context.logger.generic(2, `Creating user failed! ${username}`);
        res.status(500).json({
          message: "Application Error: Creating the user account failed!",
        });
        context.logger.httpLog(req, res);
        return;
      }

      // Before returning, lets append their PAT token
      createdUser.content.token = params.token;

      res.redirect(
        `https://web.pulsar-edit.dev/users?token=${createdUser.cotnent.token}`
      );
      context.logger.httpLog(req, res);
      return;
    } catch (err) {
      context.logger.generic(2, "/api/pat Caught an Error!", {
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

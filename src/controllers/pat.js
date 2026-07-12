const superagent = require("superagent");

module.exports = {
  "/api/pat": {
    options: {},
    get: {
      summary: "PAT Token Signup URL.",
      responses: {
        200: {
          description: "",
          headers: {
            Allow: "$COMPUTE",
            "RateLimit-Policy": "$COMPUTE.default",
            "$DEFAULT": "$COMPUTE",
            "X-Response-Time": "$COMPUTE",
            "Server-Timing": "$COMPUTE"
          }
        }
      },
      parameters: [
        {
          name: "token",
          in: "query",
          required: true,
          allowEmptyValue: false,
          description: "The PAT token to use for account signup.",
          schema: {
            type: "string"
          }
        }
      ],
      logic: {
        config: {
          preferResponse: 200
        },
        middleware: [ "$DEFAULT" ],
        func: async (ctx, next) => {
          // TODO: This whole function follows our old format, this **MUST**
          // be refactored to meet new guidelines and best practices


          // TODO once we switch to JSON schema that can exit if a required
          // variable isn't present, we can skip this check
          if (!ctx.state.params.token) {
            ctx.body = { message: "Not Found: Parameter 'token' is empty" };
            ctx.status = 404;
            return;
          }

          try {
            const userData = await superagent
              .get("https://api.github.com/user")
              .set({ Authorization: `Bearer ${ctx.state.params.token}`})
              .set({ "User-Agent": ctx.pulsar.config.GH_USERAGENT });

            if (userData.status !== 200) {
              ctx.body = { message: `Application Error: Received HTTP Status ${userData.status} when contacting GitHub!` };
              ctx.status = 500;
              return;
            }

            // Now to build a valid user object
            const username = userData.body.login;
            const userId = userData.body.node_id;
            const userAvatar = userData.body.avatar_url;

            const userExists = await ctx.pulsar.db.getUserByNodeID(userId);

            if (userExists.ok) {
              // If we plan to allow updating the user name or image,
              // we would do so here

              // Redirect to the frontend
              ctx.redirect(
                `https://packages.pulsar-edit.dev/users?token=${ctx.state.params.token}`
              );
              ctx.status = 302;
              return;
            }

            let createdUser = await ctx.pulsar.db.insertNewUser(
              username,
              userId,
              userAvatar
            );

            if (!createdUser.ok) {
              ctx.body = { message: "Application Error: Creating the user account failed!" };
              ctx.status = 500;
              return;
            }

            // Before returning, lets append their PAT token
            createdUser.content.token = ctx.state.params.token;

            ctx.redirect(
              `https://packages.pulsar-edit.dev/users?token=${createdUser.content.token}`
            );
            ctx.status = 302;
          } catch(err) {
            // With KoaJS's improved error handling we don't need to manually account for this
            // unless we wanted to customize the error return from `superagent`
            // such as inspecting it's error response for detecting if any private
            // data is in it, such as the token
            console.error(err);
            ctx.body = { message: "Application Error: The server encountered an error processing the request." };
            ctx.status = 500;
            return;
          }
        }
      }
    }
  }
};

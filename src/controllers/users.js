module.exports = {
  "/api/users": {
    options: {
      summary: "Define permitted communication options for '/api/users'.",
      description: "This method is especially important here for CORS to work when users login.",
      responses: {
        204: {
          description: "The permitted communication options.",
          headers: {
            Allow: "$COMPUTE",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Access-Control-Allow-Credentials",
            "Access-Control-Allow-Origin": "https://packages.pulsar-edit.dev",
            "Access-Control-Allow-Credentials": "true"
          }
        }
      },
      parameters: [],
      logic: {
        config: { responseStatusHeaders: 204 },
        middleware: ["$DEFAULT"],
        func: async (ctx, next) => { ctx.status = 204; }
      }
    },
    get: {
      summary: "Display details of the currently authenticated user.",
      description: "This endpoint only exists on the web version of the upstream API. Having no backend equivalent.",
      responses: {
        200: {
          description: "Details of the Authenticated User Account.",
          content: {
            "application/json": "TODO"
          },
          headers: {
            Allow: "$COMPUTE",
            "$DEFAULT": "$COMPUTE",
            "X-Response-Time": "$COMPUTE",
            "Server-Timing": "$COMPUTE",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Access-Control-Allow-Credentials",
            "Access-Control-Allow-Origin": "https://packages.pulsar-edit.dev",
            "Access-Control-Allow-Credentials": "true",
          }
        }
      },
      parameters: [
        {
          name: "Authorization",
          in: "header",
          description: "Authorization Headers",
          required: true,
          allowEmptyValue: false,
          schema: {
            type: "string"
          }
        }
      ],
      logic: {
        config: {
          allowExit: [ "auth.verify" ],
          // ^^ We allow bad auth to exit if it fails, so we don't have to check
          responseStatusHeaders: 200
        },
        middleware: [
          "$DEFAULT", "auth.verify"
        ],
        func: async (ctx, next) => {
          ctx.state.timecop.start("logic");
          if (ctx.state.funcs.auth.verify instanceof Error) {
            // An error was thrown somewhere we disallowed it to be, and now we've
            // gotta handle it. Which should never happen since we excplicetly
            // allow this value to error out. So lets throw something
            throw new Error("What is happening!!");
          }

          // TODO We need to find a way to add the users published packages here
          // When we do we will want to match the schema in ./docs/returns.md#userobjectfull
          // Until now we will return the public details of their account.
          const user = {
            username: ctx.state.funcs.auth.verify.content.username,
            avatar: ctx.state.funcs.auth.verify.content.avatar,
            created_at: ctx.state.funcs.auth.verify.content.created_at,
            data: ctx.state.funcs.auth.verify.content.data,
            node_id: ctx.state.funcs.auth.verify.content.node_id,
            token: ctx.state.funcs.auth.verify.content.token,
            // ^^ Since this is for the authed user we can return
            packages: [], // Included as it should be used in future updates
          };

          ctx.body = user;
          ctx.status = 200;
          ctx.state.timecop.end("logic");
        }
      }
    }
  }
};

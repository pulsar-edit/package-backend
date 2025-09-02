/**
 * @module getUsers
 */

module.exports = {
  docs: {
    summary:
      "Display details of the currently authenticated user. This endpoint is undocumented and is somewhat strange.",
    description:
      "This endpoint only exists on the web version of the upstream API. Having no backend equivalent.",
    responses: {
      200: {
        description: "Details of the Authenticated User Account.",
        content: {
          "application/json": "$userObjectPrivate",
        },
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: ["/api/users"],
    rateLimit: "auth",
    successStatus: 200,
    options: {
      Allow: "GET",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, Access-Control-Allow-Credentials",
      "Access-Control-Allow-Origin": "https://packages.pulsar-edit.dev",
      "Access-Control-Allow-Credentials": true,
    },
  },
  params: {
    auth: (context, req) => {
      return context.query.auth(req);
    },
  },
  async preLogic(req, res, context) {
    res.header("Access-Control-Allow-Methods", "GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Access-Control-Allow-Credentials"
    );
    res.header("Access-Control-Allow-Origin", "https://packages.pulsar-edit.dev");
    res.header("Access-Control-Allow-Credentials", true);
  },
  async postLogic(req, res, context) {
    res.set({ "Access-Control-Allow-Credentials": true });
  },

  /**
   * @async
   * @memberOf getUsers
   * @desc Returns the currently authenticated Users User Details.
   */
  async logic(params, context) {
    const user = await context.auth.verifyAuth(params.auth, context.database);

    if (!user.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(user).addCalls("auth.verifyAuth", user);
    }

    // TODO We need to find a way to add the users published pacakges here
    // When we do we will want to match the schema in ./docs/returns.md#userobjectfull
    // Until now we will return the public details of their account.
    const returnUser = {
      username: user.content.username,
      avatar: user.content.avatar,
      created_at: user.content.created_at,
      data: user.content.data,
      node_id: user.content.node_id,
      token: user.content.token, // Since this is for the auth user we can provide token
      packages: [], // Included as it should be used in the future
    };

    // Now with the user, since this is the authenticated user we can return all account details.

    const sso = new context.sso();

    return sso.isOk().addContent(returnUser);
  },
};

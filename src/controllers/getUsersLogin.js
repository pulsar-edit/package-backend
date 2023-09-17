/**
 * @module getUsersLogin
 */

module.exports = {
  docs: {
    summary: "Display the details of any user, as well as the packages they have published.",
    responses: {
      200: {
        description: "The public details of a specific user.",
        content: {
          // This references the file name of a `./tests/models` model
          "application/json": "$userObjectPublic"
        }
      },
      404: {
        description: "The User requested cannot be found.",
        content: {
          "application/json": "$message"
        }
      }
    }
  },
  endpoint: {
    method: "GET",
    paths: [ "/api/users/:login" ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {
    login: (context, req) => { return context.query.login(req); }
  },

  /**
   * @async
   * @memberOf getUserLogin
   * @desc Returns the user account details of another user. Including all
   * packages published.
   */
  async logic(params, context) {
    let user = await context.database.getUserByName(params.login);

    if (!user.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(user)
                .addCalls("db.getUserByName", user);
    }

    // TODO We need to find a way to add the users published pacakges here
    // When we do we will want to match the schema in ./docs/returns.md#userobjectfull
    // Until now we will return the public details of their account.

    // Although now we have a user to return, but we need to ensure to strip any
    // sensitive details since this return will go to any user.
    const returnUser = {
      username: user.content.username,
      avatar: user.content.avatar,
      created_at: `${user.content.created_at}`,
      data: user.content.data ?? {},
      packages: [], // included as it should be used in the future
    };


    const sso = new context.sso();

    return sso.isOk().addContent(returnUser);
  }
};

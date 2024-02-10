/**
 * @module getUsersLoginStars
 */

module.exports = {
  docs: {
    summary: "List a user's starred packages.",
    responses: {
      200: {
        description: "Return value is similar to `GET /api/packages`.",
        content: {
          "application/json": "$packageObjectShortArray",
        },
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: ["/api/users/:login/stars"],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    login: (context, req) => {
      return context.query.login(req);
    },
  },
  async logic(params, context) {
    const user = await context.database.getUserByName(params.login);

    if (!user.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(user).addCalls("db.getUserByName", user);
    }

    let pointerCollection = await context.database.getStarredPointersByUserID(
      user.content.id
    );

    if (!pointerCollection.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(pointerCollection)
        .addCalls("db.getUserByName", user)
        .addCalls("db.getStarredPointersByUserID", pointerCollection);
    }

    // Since even if the pointerCollection is okay, it could be empty. Meaning the user
    // has no stars. This is okay, but getPackageCollectionByID will fail, and result
    // in a not found when discovering no packages by the ids passed, which is none.
    // So we will catch the exception of pointerCollection being an empty array.

    if (
      Array.isArray(pointerCollection.content) &&
      pointerCollection.content.length === 0
    ) {
      // Check for array to protect from an unexpected return
      const sso = new context.sso();

      return sso.isOk().addContent([]);
    }

    let packageCollection = await context.database.getPackageCollectionByID(
      pointerCollection.content
    );

    if (!packageCollection.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(packageCollection)
        .addCalls("db.getUserByName", user)
        .addCalls("db.getStarredPointersByUserID", pointerCollection)
        .addCalls("db.getPackageCollectionByID", packageCollection);
    }

    packageCollection = await utils.constructPackageObjectShort(
      packageCollection.content
    );

    const sso = new context.sso();

    return sso.isOk().addContent(packageCollection);
  },
};

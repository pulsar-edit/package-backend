/**
 * @module getUpdates
 */

module.exports = {
  docs: {
    summary: "List Pulsar Updates",
    description:
      "Currently returns 'Not Implemented' as Squirrel AutoUpdate is not supported.",
    responses: [
      {
        200: {
          description:
            "Atom update feed, following the format expected by Squirrel.",
          content: {},
        },
      },
    ],
  },
  endpoint: {
    method: "GET",
    paths: ["/api/updates"],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {},

  /**
   * @async
   * @memberof getUpdates
   * @function logic
   * @desc Used to retreive new editor update information.
   * @todo This function has never been implemented within Pulsar.
   */
  async logic(params, context) {
    const sso = new context.sso();

    return sso.notOk().addShort("not_supported");
  },
};

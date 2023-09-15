/**
 * @module getPackagesSearch
 */

module.exports = {
  docs: {
    summary: "Searches all packages."
  },
  endpoint: {
    method: "GET",
    paths: [ "/api/packages/search" ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {
    sort: (context, req) => { return context.query.sort(req); },
    page: (context, req) => { return context.query.page(req); },
    direction: (context, req) => { return context.qeury.dir(req); },
    query: (context, req) => { return context.query.query(req); }
  },

  /**
   * @async
   * @memberof getPackagesSearch
   * @function logic
   * @desc Allows user to search through all packages. Using specified query params.
   * @param {object} params - The available query parameters.
   * @param {object} context - The Endpoint Context.
   * @todo Use custom LCS search.
   * @returns {ssoPaginate}
   */
  async logic(params, context) {
    // Because the task of implementing the custom search engine is taking longer
    // than expected, this will instead use super basic text searching on the DB side.
    // This is only an effort to get this working quickly and should be changed later.
    // This also means for now, the default sorting method will be downloads, not relevance.

    const packs = await context.database.simpleSearch(
      params.query,
      params.page,
      params.direction,
      params.sort
    );


    if (!packs.ok) {
      if (packs.short === "not_found") {
        // Because getting not found from the search, means the users
        // search just had no matches, we will specially handle this to return
        // an empty array instead.
        // TODO: Re-evaluate if this is needed. The empty result
        // returning 'Not Found' has been resolved via the DB.
        // But this check still might come in handy, so it'll be left in.

        const sso = new context.ssoPaginate();

        return sso.isOk().addContent([]);
      }

      const sso = new context.sso();

      return sso.notOk().addContent(packs)
                        .addCalls("db.simpleSearch", packs);
    }

    const newPacks = await context.utils.constructPackageObjectShort(packs.content);

    let packArray = null;

    if (Array.isArray(newPacks)) {
      packArray = newPacks;
    } else if (Object.keys(newPacks).length < 1) {
      packArray = [];
      // This also helps protect against misreturned searches. As in getting a 404 rather
      // than empty search results.
      // See: https://github.com/confused-Techie/atom-backend/issues/59
    } else {
      packArray = [newPacks];
    }

    const ssoP = new context.ssoPaginate();

    ssoP.total = packs.pagination.total;
    ssoP.limit = packs.pagination.limit;
    ssoP.buildLink(`${context.config.server_url}/api/packages/search`, packs.pagination.page, params);

    return ssoP.isOk().addContent(packArray);
  }
};

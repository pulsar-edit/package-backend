/**
 * @module getPackagesSearch
 */

module.exports = {
  docs: {
    summary: "Searches all packages.",
    responses: {
      200: {
        description: "Any array of packages.",
        content: {
          "application/json": "$packageObjectShortArray",
        },
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: ["/api/packages/search"],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    sort: (context, req) => {
      return context.query.sort(req);
    },
    page: (context, req) => {
      return context.query.page(req);
    },
    direction: (context, req) => {
      return context.query.direction(req);
    },
    query: (context, req) => {
      return context.query.query(req);
    },
    filter: (context, req) => {
      return context.query.filter(req);
    },
    fileExtension: (context, req) => {
      return context.query.fileExtension(req);
    },
    serviceType: (context, req) => {
      return context.query.serviceType(req);
    },
    service: (context, req) => {
      return context.query.service(req);
    },
    serviceVersion: (context, req) => {
      return context.query.serviceVersion(req);
    },
    owner: (context, req) => {
      return context.query.owner(req);
    },
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

    const packs = await context.database.getSortedPackages(params);

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

      return sso
        .notOk()
        .addContent(packs)
        .addCalls("db.getSortedPackages", packs);
    }

    const newPacks = await context.models.constructPackageObjectShort(
      packs.content
    );

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

    if (params.serviceVersion !== false) {
      // We filter the serviceVersion paramter in JS, rather than in the original db call
      let i = packArray.length;
      while(i--) {
        let filteredPack = context.utils.serviceVersionFilter(packArray[i], params.service, params.serviceVersion);

        if (!filteredPack) {
          // We will get a falsy value back if the filtering failed
          packArray.splice(i, 1);
        }
      }
    }



    const ssoP = new context.ssoPaginate();

    ssoP.resultCount = packs.pagination.count;
    ssoP.totalPages = packs.pagination.total;
    ssoP.limit = packs.pagination.limit;
    ssoP.buildLink(
      `${context.config.server_url}/api/packages/search`,
      packs.pagination.page,
      params
    );

    // If we modified the pagination count via filtering on service versions, lets
    // make sure to update it here
    if (params.serviceVersion !== false) {
      if (ssoP.resultCount !== packArray.length) {
        ssoP.resultCount = packArray.length;
        /**
        WARNING: the fact that we are modifying the amount of packages
        returned here does mean our offset of the total page count is now incorrect.
        There's no easy way to fix this, unless we return all matching results from the
        database on the first call, which is expensive.
        The only saving grace here is, that technically the page count won't be wrong.
        It's just that some pages may not have the total expected amount of packages on them.
        Such as a page having under the default 30 max returns, meanwhile page 2
        might have 30, etc.
        Worse case, a page has zero results, but the second page has some.
        We may need to test in practice to see if that's the case.
        As it is now, I have a hard time imagining many services that would return
        pages and pages of results, so this may not be the biggest deal.
        Seemingly the most popular service `autocomplete.provider` does have 18 pages of results
        currently, so in an instance like that this could get pretty rough.
        */
      }
    }

    return ssoP.isOk().addContent(packArray);
  },
};

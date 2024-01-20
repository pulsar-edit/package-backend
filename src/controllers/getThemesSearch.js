/**
 * @module getThemesSearch
 */

module.exports = {
  docs: {
    summary: "Get featured packages that are themes. Previously undocumented.",
    responses: {
      200: {
        description: "A paginated response of themes.",
        content: {
          "application/json": "$packageObjectShortArray",
        },
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: ["/api/themes/search"],
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
  },

  async logic(params, context) {

    const packs = await context.database.getSortedPackages(
      params,
      true
    );

    if (!packs.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(packs).addCalls("db.getSortedPackages", packs);
    }

    const newPacks = await context.utils.constructPackageObjectShort(
      packs.content
    );

    let packArray = null;

    if (Array.isArray(newPacks)) {
      packArray = newPacks;
    } else if (Object.keys(newPacks).length < 1) {
      packArray = [];
    } else {
      packArray = [newPacks];
    }

    const ssoP = new context.ssoPaginate();

    ssoP.total = packs.pagination.total;
    ssoP.limit = packs.pagination.limit;
    ssoP.buildLink(
      `${context.config.server_url}/api/themes/search`,
      packs.pagination.page,
      params
    );

    return ssoP.isOk().addContent(packArray);
  },
};

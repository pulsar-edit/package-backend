module.exports = {
  docs: {
    summary: "List all packages published under a single owner.",
    responses: {
      200: {
        description: "A paginated response of packages.",
        content: {
          "application/json": "$packageObjectShortArray",
        },
      },
    },
  },
  endpoint: {
    method: "GET",
    paths: ["/api/owners/:ownerName"],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    page: (context, req) => {
      return context.query.page(req);
    },
    sort: (context, req) => {
      return context.query.sort(req);
    },
    direction: (context, req) => {
      return context.query.direction(req);
    },
    ownerName: (context, req) => {
      return context.query.ownerName(req);
    },
  },

  async logic(params, context) {
    const packages = await context.database.getSortedPackages(params);

    if (!packages.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(packages)
        .addCalls("db.getSortedPackages", packages);
    }

    const packObjShort = await context.models.constructPackageObjectShort(
      packages.content
    );

    const packArray = Array.isArray(packObjShort)
      ? packObjShort
      : [packObjShort];

    const ssoP = new context.ssoPaginate();

    ssoP.resultCount = packages.pagination.count;
    ssoP.totalPages = packages.pagination.total;
    ssoP.limit = packages.pagination.limit;
    ssoP.buildLink(
      `${context.config.server_url}/api/owners/${params.owner}`,
      packages.pagination.page,
      params
    );

    return ssoP.isOk().addContent(packArray);
  },
};

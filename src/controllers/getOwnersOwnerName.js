module.exports = {
  version: 2,
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
  headers: {
    Allow: "GET",
    "X-Content-Type-Options": "nosniff",
    "Server-Timing": "%timecop.toHeader"
  },
  endpoint: {
    method: "GET",
    path: "/api/owners/:ownerName",
    rateLimit: "generic"
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
    owner: (context, req) => {
      return context.query.ownerName(req);
    },
  },

  async logic(ctx) {

    ctx.timecop.start("db");
    const packages = await ctx.database.getSortedPackages(ctx.params);
    ctx.timecop.end("db");

    ctx.callStack.addCall("db.getSortedPackages", packages);

    if (!packages.ok) {
      const sso = new ctx.sso();

      return sso.notOk().addContent(packages).assignCalls(ctx.callStack);
    }

    ctx.timecop.start("construct");
    const packObjShort = await ctx.models.constructPackageObjectShort(
      packages.content
    );

    const packArray = Array.isArray(packObjShort)
      ? packObjShort
      : [packObjShort];

    const ssoP = new ctx.ssoPaginate();

    ssoP.resultCount = packages.pagination.count;
    ssoP.totalPages = packages.pagination.total;
    ssoP.limit = packages.pagination.limit;
    ssoP.buildLink(
      `${ctx.config.server_url}/api/owners/${ctx.params.owner}`,
      packages.pagination.page,
      ctx.params
    );
    ctx.timecop.end("construct");

    return ssoP.isOk().addContent(packArray);
  },
};

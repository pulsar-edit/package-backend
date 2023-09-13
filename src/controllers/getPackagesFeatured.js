module.exports = {
  docs: {

  },
  endpoint: {
    method: "GET",
    paths: [ "/api/packages/featured" ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {},
  async logic(params, context) {
    // TODO: Does not support engine query parameter as of now
    const packs = await context.database.getFeaturedPackages();

    if (!packs.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(packs)
                        .addCalls("db.getFeaturedPackages", packs);
    }

    const packObjShort = await context.utils.constructPackageObjectShort(packs.content);

    // The endpoint using this ufnction needs an array
    const packArray = Array.isArray(packObjShort) ? packObjShort : [ packObjShort ];

    const sso = new context.sso();

    return sso.isOk().addContent(packArray);
  }
};

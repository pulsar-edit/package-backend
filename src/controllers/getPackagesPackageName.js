module.exports = {
  docs: {

  },
  endpoint: {
    method: "GET",
    paths: [
      "/api/packages/:packageName",
      "/api/themes/:packageName"
    ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "DELETE, GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {
    engine: (context, req) => { return context.query.engine(req.query.engine); },
    name: (context, req) => { return context.query.packageName(req); }
  },

  async logic(params, context) {
    let pack = await context.database.getPackageByName(params.name, true);

    if (!pack.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(pack)
                        .addCalls("db.getPackageByName", pack);
    }

    pack = await context.utils.constructPackageObjectFull(pack.content);

    if (params.engine !== false) {
      // query.engine returns false if no valid query param is found.
      // before using engineFilter we need to check the truthiness of it.

      pack = await context.utils.engineFilter(pack, params.engine);
    }

    const sso = new context.sso();

    return sso.isOk().addcontent(pack);
  }
};

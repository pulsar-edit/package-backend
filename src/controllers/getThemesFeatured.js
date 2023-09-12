module.exports = {
  endpoint: {
    method: "GET",
    paths: [ "/api/themes/featured" ],
    rate_limit: "generic",
    success_status: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {
    // Currently we don't seem to utilize any query parameters here.
    // We likely want to make this match whatever is used in getPackagesFeatured.js
  },
  async logic(params, context) {
    const col = await context.database.getFeaturedThemes();

    if (!col.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(col).addCalls("db.getFeaturedThemes", col);
    }

    const newCol = await utils.constructPackageObjectShort(col.content);

    const sso = new context.sso();

    return sso.isOk().addContent(newCol);
  }
};

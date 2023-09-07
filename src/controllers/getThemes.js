
module.exports = {
  endpoint: {
    method: "GET",
    paths: [ "/api/themes" ],
    rate_limit: "generic",
    options: {
      Allow: "POST, GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params(req, context) {
    return {
      page: context.query.page(req),
      sort: context.query.sort(req),
      direction: context.query.dir(req)
    };
  },

  /**
   * @async
   * @memberOf getThemes
   * @function logic
   * @desc Returns all themes to the user. Based on any filters they've applied
   * via query parameters.
   * @returns {object} PaginateSSO
   */
  async logic(params, context) {

    const packages = await context.database.getSortedPackages(params, true);

    if (!packages.ok) {
      context.logger.generic(
        3,
        `getThemes-getSortedPackages Not OK: ${packages.content}`
      );
      return {
        ok: false,
        content: packages
      };
    }

    const page = packages.pagination.page;
    const totPage = packages.pagination.total;
    const packObjShort = await context.utils.constructPackageObjectShort(
      packages.content
    );

    const packArray = Array.isArray(packObjShort) ? packObjShort : [ packObjShort ];

    let link = `<${server_url}/api/themes?page=${page}&sort=${params.sort}&order=${params.direction}>; rel="self", <${server_url}/api/themes?page=${totPage}&sort=${params.sort}&order=${params.direction}>; rel="last"`;

    if (page !== totPage) {
      link += `, <${server_url}/api/themes?page=${page + 1}&sort=${
        params.sort
      }&order=${params.direction}>; rel="next"`;
    }

    return {
      ok: true,
      link: link,
      total: packages.pagination.count,
      limit: packages.pagination.limit,
      content: packArray
    };
  }
};


module.exports = {
  endpoint(app, context) {
    app.get("/api/themes", context.genericLimit, async (req, res, next) => {
      const ret = await this.logic(
        {
          page: context.query.page(req),
          sort: context.query.sort(req),
          direction: context.query.dir(req)
        },
        context
      );

      if (!ret.ok) {
        await context.common_handler.handleError(req, res, ret.content);
        return;
      }

      // This is a paginated endpoint
      res.append("Link", ret.link);
      res.append("Query-Total", ret.total);
      res.append("Query-Limit", ret.limit);

      res.status(200).json(ret.content);
      context.logger.httpLog(req, res);
    });
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

    const packages = await context.db.getSortedPackages(params, true);

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

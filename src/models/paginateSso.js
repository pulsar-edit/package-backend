module.exports =
class PaginateSSO {
  constructor() {
    this.kind = "paginateSSO";
    this.link;
    this.total;
    this.limit;
    this.content;
    this.ok;
  }

  buildLink(url, currentPage, totalPages, params) {
    let paramString = "";

    for (let param of params) {
      paramString += `&param=${params[param]}`;
    }

    let linkString = "";

    linkString += `<${url}?page=${currentPage}${paramString}>; rel="self", `;
    linkString += `<${url}?page=${totalPages}${paramString}>; rel="last"`;

    if (currentPage !== totalPages) {
      linkString += `, <${url}?page=${currentPage + 1}${paramString}>; rel="next"`;
    }

    this.link = linkString;
  }

  httpReturn(req, res, logger) {

    res.append("Link", this.link);
    res.append("Query-Total", this.total);
    res.append("Query-Limit", this.limit);

    res.status(200).json(ret.content);
    logger.httpLog(req, res);
  }
}

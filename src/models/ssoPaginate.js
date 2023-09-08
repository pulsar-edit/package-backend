const SSO = require("./sso.js");

module.exports =
class SSOPaginate extends SSO {
  constructor() {
    super();

    this.link;
    this.total;
    this.limit;
  }

  buildLink(url, currentPage, params) {
    let paramString = "";

    for (let param of params) {
      paramString += `&param=${params[param]}`;
    }

    let linkString = "";

    linkString += `<${url}?page=${currentPage}${paramString}>; rel="self", `;
    linkString += `<${url}?page=${this.total}${paramString}>; rel="last"`;

    if (currentPage !== this.total) {
      linkString += `, <${url}?page=${currentPage + 1}${paramString}>; rel="next"`;
    }

    this.link = linkString;
  }

  handleSuccess(req, res, context) {

    res.append("Link", this.link);
    res.append("Query-Total", this.total);
    res.append("Query-Limit", this.limit);

    res.status(this.successStatusCode).json(this.content);
    context.logger.httpLog(req, res);
    return;
  }
}

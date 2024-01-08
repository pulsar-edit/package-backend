const SSO = require("./sso.js");

module.exports =
class SSOPaginate extends SSO {
  constructor() {
    super();

    this.link = "";
    this.totalPages = 0;
    this.resultCount = 0;
    this.limit = 0;
  }

  buildLink(url, currentPage, params) {
    let paramString = "";

    for (let param in params) {
      // We manually assign the page query so we will skip
      if (param === "page") {
        continue;
      }
      if (param === "query") {
        // Since we know we want to keep search queries safe strings
        const safeQuery = encodeURIComponent(
          params[param].replace(/[<>"':;\\/]+/g, "")
        );
        paramString += `&${param}=${safeQuery}`;
      } else {
        paramString += `&${param}=${params[param]}`;
      }
    }

    let linkString = "";

    linkString += `<${url}?page=${currentPage}${paramString}>; rel="self", `;
    linkString += `<${url}?page=${this.totalPages}${paramString}>; rel="last"`;

    if (currentPage !== this.totalPages) {
      linkString += `, <${url}?page=${parseInt(currentPage) + 1}${paramString}>; rel="next"`;
    }

    this.link = linkString;
  }

  handleSuccess(req, res, context) {

    res.append("Link", this.link);
    res.append("Query-Total", this.resultCount);
    res.append("Query-Limit", this.limit);

    res.status(this.successStatusCode).json(this.content);
    context.logger.httpLog(req, res);
    return;
  }
}

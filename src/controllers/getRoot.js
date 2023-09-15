/**
 * @module getRoot
 */

module.exports = {
  docs: {
    summary: "Non-Essential endpoint to return status message, and link to Swagger Instance."
  },
  endpoint: {
    method: "GET",
    paths: [ "/" ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {},
  async logic(params, context) {
    const str = `
      <p>Server is up and running Version ${context.server_version}</p>
      <a href="/swagger-ui">Swagger UI</a></br>
      <a href="https://github.com/pulsar-edit/package-backend/tree/main/docs" targ="_blank">Documentation</a>
    `;

    const sso = new context.ssoHTML();

    return sso.isOk().addContent(str);
  }
};

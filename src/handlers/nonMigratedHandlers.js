const oauth_handler = require("./oauth_handler.js");

function setup(app, genericLimit, authLimit) {

  app.get("/api/login", authLimit, async (req, res) => {
    await oauth_handler.getLogin(req, res);
  });

  app.options("/api/login", genericLimit, async (req, res) => {
    res.header({
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    });
    res.sendStatus(204);
  });

  //=============================================================

  app.get("/api/oauth", authLimit, async (req, res) => {
    await oauth_handler.getOauth(req, res);
  });

  app.options("/api/oauth", genericLimit, async (req, res) => {
    res.header({
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    });
    res.sendStatus(204);
  });

  //=============================================================

  app.get("/api/pat", authLimit, async (req, res) => {
    await oauth_handler.getPat(req, res);
  });

  app.options("/api/pat", genericLimit, async (req, res) => {
    res.header({
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    });
    res.sendStatus(204);
  });

  return app;
}

module.exports = setup;

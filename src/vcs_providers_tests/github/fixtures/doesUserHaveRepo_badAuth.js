const express = require("express");
const app = express();

let port = "9999";

app.get("/user/repos", async (req, res) => {
  // We will return that these are invalid credentials no matter what
  res
    .status(401)
    .set({
      Authorization: req.get("Authorization"),
      "User-Agent": req.get("User-Agent"),
      Link: `<localhost:${port}/user/repos?page=1>; rel="first", <localhost:${port}/user/repos?page=1>; rel="last"`,
    })
    .json({
      message: "Requires authentication",
      documentation_url: "https://docs.github.com/rest/reference/repo#list-repositories-for-the-authenticated-user"
    });
});

function setPort(val) {
  port = val;
}

module.exports = {
  app,
  setPort,
};

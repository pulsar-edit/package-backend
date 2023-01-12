const express = require("express");
const app = express();

let port, repoName;

app.get("/user/repos", async (req, res) => {
  res
    .status(200)
    .set({
      Authorization: req.get("Authorization"),
      "User-Agent": req.get("User-Agent"),
      Link: `<localhost:${port}/user/repos?page=1; rel="first", <localhost:${port}/user/repos?page=1; rel="last"`
    })
    .json([
      {
        id: 123456,
        full_name: repoName
      }
    ]);
});

function setRepoName(val) {
  reponame = val;
}

function setPort(val) {
  port = val;
}

module.exports = {
  app,
  setRepoName,
  setPort,
};

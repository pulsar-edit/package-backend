const express = require("express");
const app = express();

let port, repoName = [];

app.get("/user/repos", async (req, res) => {
  switch(parseInt(req.query.page, 10)) {
    case 2: // Only return the page the test wants
    // on the second page
      res
        .status(200)
        .set({
          Authorization: req.get("Authorization"),
          "User-Agent": req.get("User-Agent"),
          Link: `<localhost:${port}/user/repos?page=1>; rel="first", <localhost:${port}/user/urepos?page=2>, rel="self"`
        })
        .json([
          {
            id: 123456,
            full_name: repoName[1]
          }
        ]);
      break;
    case 1:
    default:
      res
        .status(200)
        .set({
          Authorization: req.get("Authorization"),
          "User-Agent": req.get("User-Agent"),
          Link: `<localhost:${port}/user/repos?page=1>; rel="self", <localhost:${port}/user/repos?page=2>, rel="last"`
        })
        .json([
          {
            id: 123456,
            full_name: repoName[0]
          }
        ]);
  }
});

function setRepoName(val) {
  repoName = val;
}

function setPort(val) {
  port = val;
}

module.exports = {
  app,
  setRepoName,
  setPort,
};

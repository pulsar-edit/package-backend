const PORT = parseInt(process.env.PORT) || 8080;
const express = require("express");
const app = express();

const MAX_LENGTH = 50;

app.get("/search", async (req, res) => {
  let params = {
    q: (typeof prov === "string") ? prov.slice(0, MAX_LENGTH).trim() : "",
  };

  // Now to actually search

});

const serve = app.listen(port, () => {
  console.log(`Search Microservice Listening on port ${port}`);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server.");
  serve.close(() => {
    console.log("HTTP Server Closed");
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server.");
  serve.close(() => {
    console.log("HTTP Server Closed");
  });
});

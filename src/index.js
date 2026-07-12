const app = require("./app.js");
const { port } = require("./config.js").getConfig();
const logger = require("./logger.js");
const database = require("./database/_export.js");

if (process.env.PULSAR_STATUS === "dev") {
  logger.generic(3, "Pulsar Server is in Development Mode!");
}

const serve = app.listen(port, () => {
  logger.generic(4, `Pulsar Server Listening on port ${port}`);
});

process.on("SIGTERM", async () => {
  await exterminate("SIGTERM");
});

process.on("SIGINT", async () => {
  await exterminate("SIGINT");
});

async function exterminate(callee) {
  console.log(`${callee} signal received: closing HTTP server`);
  await database.shutdownSQL();
  serve.close(() => {
    console.log("HTTP Server Closed.");
  });
}

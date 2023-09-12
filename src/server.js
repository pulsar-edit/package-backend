/**
 * @module server
 * @desc The initializer of `main.js` starting up the Express Server, and setting the port
 * to listen on. As well as handling a graceful shutdown of the server.
 */

const app = require("./setupEndpoints.js");
const { port } = require("./config.js").getConfig();
const logger = require("./logger.js");
const database = require("./database.js");

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

/**
 * @async
 * @function exterminate
 * @desc This is called when the server process receives a `SIGINT` or `SIGTERM` signal.
 * Which this will then handle closing the server listener, as well as calling `data.Shutdown`.
 * @param {string} callee - Simply a way to better log what called the server to shutdown.
 */
async function exterminate(callee) {
  console.log(`${callee} signal received: closing HTTP server.`);
  await database.shutdownSQL();
  console.log("Exiting...");
  serve.close(() => {
    console.log("HTTP Server Closed.");
  });
}

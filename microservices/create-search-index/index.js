const http = require("http");
const postgres = require("postgres");
const port = parseInt(process.env.PORT) || 8080;

// DB Variables
const db_host = process.env.DB_HOST;
const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const db_db = process.env.DB_DB;
const db_port = process.env.DB_PORT;
const db_ssl_cert = process.env.DB_SSL_CERT;

let sql;

const server = http.createServer(async (req, res) => {
  const path = req.url.split("?"); // strip any query params

  if (path[0] === "/" && req.method === "POST") {

    console.log(`Create Search Index Job Triggered: ${req.url} - ${req.headers["user-agent"]}`);

    let job = await runJob();

    if (!job.ok) {
      console.log(`Create Search Index Job FAILED: ${job}`);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.write(JSON.stringify({ message: "The Job Failed" }));
      res.end();
    }

    // The Job Succeeded
    console.log(`Create Search Index Job SUCCESS: ${job.content}`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ message: "Success!" }));
    res.end();

    // Disconnect our DB connection

    shutdownSQL();

  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ message: "Location Not Found" }));
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Create Search Index Microservice Exposed on Port: ${port}`);
});

function setupSQL() {
  return process.env.PULSAR_STATUS === "dev"
  ? postgres({
    host: db_host,
    username: db_user,
    database: db_db,
    port: db_port
  })
  : postgres({
    host: db_host,
    username: db_user,
    password: db_pass,
    database: db_db,
    port: db_port,
    ssl: {
      rejectUnauthorized: true,
      ca: db_ssl_cert
    }
  });
}

function shutdownSQL() {
  if (sql !== undefined) {
    sql.end();
    console.log("Create Search Index Shutdown SQL Connection!");
  }
  return;
}

async function runJob() {
  try {
    sql ??= setupSQL();

    // From here we need to get EVERYTHING, and upload it to cloud storage
  } catch(err) {
    console.log("Create Search Index Encountered an Error!");
    console.log(err);
    return {
      ok: false,
      content: err
    };
  }
}

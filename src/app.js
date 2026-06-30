const { performance } = require("node:perf_hooks");
const Koa = require("koa");
const Router = require("@koa/router");
const routes = require("./controllers/routes.js");
const app = new Koa();
const router = new Router();

// === Setup Context
app.context.pulsar = {};
app.context.pulsar.auth = require("./auth.js");

// === Setup Error Handler
app.use(async (ctx, next) => {
  // Top Level Error Handler
  try {
    await next();
  } catch(err) {
    ctx.status = err.status || err.statusCode || 500;
    ctx.body = { message: err.message ?? err.toString() };
    ctx.app.emit("error", err, ctx);
  }
});

// === Setup Routing
const startCompute = performance.now();

const stopCompute = performance.now();
const startBuild = performance.now();

const stopBuild = performance.now();

console.log(`Started Server. Compute: ${Number(stopCompute - startCompute).toFixed(2)}ms; Build: ${Number(stopBuild - startBuild).toFixed(2)}ms`);

app.use(router.routes()).use(router.allowedMethods());

module.exports = app;

const Koa = require("koa");
const KoaRouter = require("koa-router");
const koaBody = require("koa-body");
const qs = require("qs");

const app = new Koa();
const router = new KoaRouter();

app.use(koaBody());

// do_GET
router.get("/(.*)", (ctx) => {
  console.log("## do_GET() activated.");

  printHttpRequestDetail(ctx);
  sendHttpResponseHeader(ctx);

  if (ctx.url.includes("?")) {
    const routine = ctx.url.split("?")[1];
    const params = parameterRetrieval(routine);
    const result = simpleCalc(Number(params[0]), Number(params[1]));

    ctx.body = `
      <html>
        <p>GET request for calculation => ${params[0]} x ${params[1]} = ${result}</p>
      </html>
    `;
    console.log(
      `## GET request for calculation => ${params[0]} x ${params[1]} = ${result}`
    );
  } else {
    ctx.body = `
      <html>
        <p>HTTP Request GET for Path: ${ctx.url}</p>
      </html>
    `;
    console.log(`## GET request for directory => ${ctx.url}.`);
  }
});

// do_POST
router.post("/(.*)", (ctx) => {
  console.log("## do_POST() activated.");

  printHttpRequestDetail(ctx);
  sendHttpResponseHeader(ctx);

  const post_data = qs.stringify(ctx.request.body.data);
  const params = parameterRetrieval(post_data);
  const result = simpleCalc(Number(params[0]), Number(params[1]));

  const postResponse = `POST request for calculation => ${params[0]} x ${params[1]} = ${result}`;
  ctx.body = postResponse;

  console.log(`## POST request data => ${post_data}`);
  console.log(
    `## POST request for calculation => ${params[0]} x ${params[1]} = ${result}`
  );
});

const printHttpRequestDetail = async (ctx, next) => {
  console.log(`::Client address  : ${ctx.request.socket.remoteAddress}`);
  console.log(`::Client port     : ${ctx.request.socket.remotePort}`);
  console.log(`::Request Command : ${ctx.request.method}`);
  console.log(
    `::Request line    : ${ctx.request.method} ${ctx.request.originalUrl} HTTP/${ctx.request.req.httpVersion}`
  );
  console.log(`::Request path    : ${ctx.request.originalUrl}`);
  console.log(`::Request version : HTTP/${ctx.request.req.httpVersion}`);
};

const sendHttpResponseHeader = async (ctx, next) => {
  ctx.status = 200;
  ctx.header["content-type"] = "text/html";
};

app.use(router.routes()).use(router.allowedMethods());

// simple_calc
const simpleCalc = (param1, param2) => {
  return param1 * param2;
};

// parameter_retrieval
const parameterRetrieval = (msg) => {
  const result = [];

  const params = msg.split("&");
  result.push(params[0].split("=")[1]);
  result.push(params[1].split("=")[1]);

  return result;
};

server_name = "localhost";
server_port = 8080;

console.log(`## HTTP server started at http://${server_name}:${server_port}.`);

try {
  app.listen(server_port, server_name);
} catch {
  //
}

app.on("close", () => {
  console.log("HTTP server stopped.");
});

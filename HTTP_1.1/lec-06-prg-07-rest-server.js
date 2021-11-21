const Koa = require("koa");
const KoaRouter = require("koa-router");
const koaBody = require("koa-body");
const qs = require("qs");

const app = new Koa();
const router = new KoaRouter();

app.use(koaBody());

class MembershipHandler {
  constructor() {
    // dictionary for membership management
    this.database = {};
  }

  // PUT request
  create(id, value) {
    if (this.database[id]) {
      return {
        [id]: "None",
      };
    }

    this.database[id] = value;
    return {
      [id]: this.database[id],
    };
  }

  // GET request
  read(id) {
    if (this.database[id]) {
      return {
        [id]: this.database[id],
      };
    }

    return {
      [id]: "None",
    };
  }

  // POST request
  update(id, value) {
    if (this.database[id]) {
      this.database[id] = value;
      return {
        [id]: this.database[id],
      };
    }

    return {
      [id]: "None",
    };
  }

  // DELETE request
  delete(id) {
    if (this.database[id]) {
      delete this.database[id];
      return {
        [id]: "Removed",
      };
    }

    return {
      [id]: "None",
    };
  }
}

const myManager = new MembershipHandler();

// PUT
router.put("/membership_api/:id", (ctx) => {
  const { id } = ctx.params;
  const value = ctx.request.body[id];
  ctx.body = myManager.create(id, value);
});

// GET
router.get("/membership_api/:id", (ctx) => {
  const { id } = ctx.params;
  ctx.body = myManager.read(id);
});

// POST
router.post("/membership_api/:id", (ctx) => {
  const { id } = ctx.params;
  const value = ctx.request.body[id];
  ctx.body = myManager.update(id, value);
});

// DELETE
router.delete("/membership_api/:id", (ctx) => {
  const { id } = ctx.params;
  ctx.body = myManager.delete(id);
});

const sendHttpResponseHeader = async (ctx, next) => {
  ctx.status = 200;
  ctx.header["content-type"] = "text/html";
  next();
};

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(sendHttpResponseHeader);

server_name = "localhost";
server_port = 5000;

try {
  app.listen(server_port, server_name);
} catch {
  //
}

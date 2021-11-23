const zmq = require("zeromq");

class ServerTask {
  constructor(num_server) {
    this.num_server = num_server;
  }

  async run() {
    const frontend = new zmq.Router();
    await frontend.bind("tcp://*:5570");

    const backend = new zmq.Dealer();
    await backend.bind("inproc://backend");

    const workers = [];

    for (let i = 0; i < this.num_server; i++) {
      const worker = new ServerWorker(i);
      worker.run();
      workers.push(worker);
    }

    const proxy = new zmq.Proxy(frontend, backend);
    proxy.run();
  }
}

class ServerWorker {
  constructor(id) {
    this.id = id;
  }

  async run() {
    const worker = new zmq.Dealer();
    worker.connect("inproc://backend");
    console.log(`Worker#${this.id} started`);

    for await (const [ident, msg] of worker) {
      console.log(`Worker#${this.id} received ${msg} from ${ident}`);
      await worker.send([ident, ident, msg]);
    }
  }
}

const server = new ServerTask(Number(process.argv[2]));
server.run();

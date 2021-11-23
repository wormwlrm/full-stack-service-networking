const zmq = require("zeromq");

class ClientTask {
  constructor(id) {
    this.id = id;
  }

  async run() {
    const socket = new zmq.Dealer();
    const identify = `${this.id}`;
    socket.routingId = identify;
    socket.connect("tcp://localhost:5570");

    console.log(`Client ${identify} started`);

    let reqs = 0;

    setInterval(async () => {
      reqs = reqs + 1;
      console.log(`Req #${reqs} sent..`);
      await socket.send(`request #${reqs}`);
    }, 1000);

    for await (const [ident, msg] of socket) {
      console.log(`${ident} received: ${msg}`);
    }
  }
}

client = new ClientTask(process.argv[2]);
client.run();

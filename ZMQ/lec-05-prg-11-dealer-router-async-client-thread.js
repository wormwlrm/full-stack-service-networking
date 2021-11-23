const zmq = require("zeromq");

class ClientTask {
  constructor(id) {
    this.id = id;
    this.socket = null;
  }

  async recvHandler(socket) {
    while (true) {
      const [ident, msg] = await socket.receive();
      console.log(`${ident} received: ${msg}`);
    }
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

    this.recvHandler(socket);
  }
}

client = new ClientTask(process.argv[2]);
client.run();

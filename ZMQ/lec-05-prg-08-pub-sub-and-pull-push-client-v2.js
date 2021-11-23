const zmq = require("zeromq");

async function run() {
  const subscriber = new zmq.Subscriber();
  subscriber.connect("tcp://localhost:5557");
  subscriber.subscribe();

  const publisher = new zmq.Push();
  publisher.connect("tcp://localhost:5558");

  const clientID = process.argv[2];

  setInterval(() => {
    const rand = Math.floor(Math.random() * 100);

    if (rand < 10) {
      const msg = `(${clientID}:ON)`;
      publisher.send(msg);
      console.log(`${clientID}: send status - activated`);
    } else if (rand > 90) {
      const msg = `(${clientID}:OFF)`;
      publisher.send(msg);
      console.log(`${clientID}: send status - deactivated`);
    }
  }, 250);

  while (true) {
    const message = await subscriber.receive();
    console.log(`${clientID}: receive status => ${message.toString()}`);
  }
}

run();

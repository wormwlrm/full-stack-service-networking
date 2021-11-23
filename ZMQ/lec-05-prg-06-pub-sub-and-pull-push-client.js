const zmq = require("zeromq");

async function run() {
  const subscriber = new zmq.Subscriber();
  subscriber.connect("tcp://localhost:5557");
  subscriber.subscribe();

  const publisher = new zmq.Push();
  publisher.connect("tcp://localhost:5558");

  setInterval(() => {
    const rand = Math.floor(Math.random() * 100);
    if (rand < 10) {
      publisher.send(rand);
      console.log("I: sending message ", rand);
    }
  }, 250);

  while (true) {
    const message = await subscriber.receive();
    console.log("I: received message ", message.toString());
  }
}

run();

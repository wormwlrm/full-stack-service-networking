const zmq = require("zeromq");

const sleep = (sec) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

async function run() {
  const sock = new zmq.Reply();

  await sock.bind("tcp://*:5555");

  for await (const [msg] of sock) {
    await sleep(1);
    console.log(`Received request: ${msg}`);
    await sock.send("World");
  }
}

run();

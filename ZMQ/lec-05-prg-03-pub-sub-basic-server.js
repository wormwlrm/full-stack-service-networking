const zmq = require("zeromq");

console.log("Publishing updates at weather server...");

async function run() {
  const sock = new zmq.Publisher();

  await sock.bind("tcp://*:5556");

  while (true) {
    const zipcode = Math.floor(Math.random() * 5) + 10000;
    const temperature = Math.floor(Math.random() * (135 + 80)) - 80;
    const relhumidity = Math.floor(Math.random() * 60) + 10;

    await sock.send([zipcode, temperature, relhumidity]);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

run();

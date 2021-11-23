const zmq = require("zeromq");

console.log("Connecting to hello world server…");

async function run() {
  const sock = new zmq.Request();

  sock.connect("tcp://localhost:5555");

  for (let request = 0; request < 10; request++) {
    console.log(`Sending request ${request} …`);
    await sock.send("Hello");
    const [result] = await sock.receive();
    console.log(`Received reply ${request} [ ${result.toString()} ]`);
  }
}

run();

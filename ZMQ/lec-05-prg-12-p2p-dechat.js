const ip = require("ip");
const zmq = require("zeromq");

function get_local_ip() {
  try {
    const local_ip = ip.address();
    return local_ip;
  } catch {
    return "127.0.0.1";
  }
}

async function search_nameserver(ip_mask, local_ip_addr, port_nameserver) {
  const req = new zmq.Subscriber();

  for (let last = 0; last < 255; last++) {
    const target_ip_addr = `tcp://${ip_mask}.${last}:${port_nameserver}`;
    if (target_ip_addr != local_ip_addr || target_ip_addr == local_ip_addr) {
      req.connect(target_ip_addr);
      req.subscribe("NAMESERVER");
    }
  }

  req.receiveTimeout = 3000;

  try {
    const message = await req.receive();
    const [name, ip_addr] = message.toString().split(":");
    if (name.toString() == "NAMESERVER") {
      console.log(`name server resolved at ${ip_addr}`);
      return ip_addr;
    } else {
      console.log(`name server not found`);
      return null;
    }
  } catch {
    console.error(`name server not found`);
    return null;
  }
}
async function beacon_nameserver(local_ip_addr, port_nameserver) {
  // Generate periodic (1 second) beacon message.
  const socket = new zmq.Publisher();
  await socket.bind(`tcp://${local_ip_addr}:${port_nameserver}`);
  console.log(
    `local p2p name server bind to tcp://${local_ip_addr}:${port_nameserver}.`
  );

  setInterval(async () => {
    const msg = `NAMESERVER:${local_ip_addr}`;
    socket.send(msg);
  }, 1000);
}

async function user_manager_nameserver(local_ip_addr, port_subscribe) {
  // User subscription manager {ip address and user id}

  const user_db = [];
  const socket = new zmq.Reply();
  await socket.bind(`tcp://${local_ip_addr}:${port_subscribe}`);
  console.log(
    `local p2p db server activated at tcp://${local_ip_addr}:${port_subscribe}.`
  );

  for await (const message of socket) {
    const user_req = message.toString().split(":");
    user_db.push(user_req);
    console.log(`user registration '${user_req[1]}' from '${user_req[0]}'.`);
    socket.send("ok");
  }
}

async function relay_server_nameserver(
  local_ip_addr,
  port_chat_publisher,
  port_chat_collector
) {
  // Relay message between p2p users.
  const publisher = new zmq.Publisher();
  await publisher.bind(`tcp://${local_ip_addr}:${port_chat_publisher}`);

  const collector = new zmq.Pull();
  await collector.bind(`tcp://${local_ip_addr}:${port_chat_collector}`);

  console.log(
    `local p2p relay server activated at tcp://${local_ip_addr}:${port_chat_publisher} & ${port_chat_collector}.`
  );

  for await (const message of collector) {
    console.log("p2p-relay:<==>", message.toString());
    publisher.send(`RELAY:${message}`);
  }
}

async function main() {
  let ip_addr_p2p_server = "";
  const port_nameserver = 9001;
  const port_chat_publisher = 9002;
  const port_chat_collector = 9003;
  const port_subscribe = 9004;

  const user_name =
    process.argv[2] || `client#${Math.floor(Math.random() * 100)}`;
  const ip_addr = get_local_ip();
  const ip_mask = ip_addr.split(".").slice(0, -1).join(".");

  console.log("searching for p2p server.");

  const name_server_ip_addr = await search_nameserver(
    ip_mask,
    ip_addr,
    port_nameserver
  );

  if (name_server_ip_addr == null) {
    ip_addr_p2p_server = ip_addr;
    console.log("p2p server is not found, and p2p server mode is activated.");
    beacon_nameserver(ip_addr, port_nameserver);
    console.log("p2p beacon server is activated");
    user_manager_nameserver(ip_addr, port_subscribe);
    console.log("p2p subscriber database server is activated");
    relay_server_nameserver(ip_addr, port_chat_publisher, port_chat_collector);
    console.log("p2p message relay server is activated");
  } else {
    ip_addr_p2p_server = name_server_ip_addr;
    console.log(
      `p2p server found at ${ip_addr_p2p_server}, and p2p client mode is activated.`
    );
  }

  console.log("starting user registration procedure.");

  db_client_socket = new zmq.Request();
  db_client_socket.connect(`tcp://${ip_addr_p2p_server}:${port_subscribe}`);
  db_client_socket.send(`${ip_addr}:${user_name}`);

  let recv = await db_client_socket.receive();

  if (recv == "ok") {
    console.log("user registration to p2p server completed.");
  } else {
    console.log("user registration to p2p server failed.");
  }

  console.log("starting message transfer procedure.");

  const p2p_rx = new zmq.Subscriber();
  p2p_rx.connect(`tcp://${ip_addr_p2p_server}:${port_chat_publisher}`);
  p2p_rx.subscribe("RELAY");

  const p2p_tx = new zmq.Push();
  p2p_tx.connect(`tcp://${ip_addr_p2p_server}:${port_chat_collector}`);
  console.log("starting autonomous message transmit and receive scenario.");

  setInterval(async () => {
    const random = Math.floor(Math.random() * 100);
    if (random < 10) {
      let msg = `(${user_name},${ip_addr}:ON)`;
      p2p_tx.send(msg);
      console.log("p2p-send::==>>", msg);
    } else if (random > 90) {
      let msg = `(${user_name},${ip_addr}:OFF)`;
      p2p_tx.send(msg);
      console.log("p2p-send::==>>", msg);
    }
  }, 1000);

  for await (const msg of p2p_rx) {
    const [_relay, ...message] = msg.toString().split(":");
    console.log(`p2p-recv::<==>${message[0]}:${message[1]}`);
  }
}

main();

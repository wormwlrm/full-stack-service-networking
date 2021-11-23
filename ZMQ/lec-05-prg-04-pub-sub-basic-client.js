const zmq = require("zeromq");

console.log("Collecting updates from weather server...");

async function run() {
  const sock = new zmq.Subscriber();

  sock.connect("tcp://localhost:5556");
  const zip_filter = process.argv[2] || "10001";
  sock.subscribe(zip_filter);

  let total_temp = 0;
  let update_nbr = 0;

  for await (const [zip_code, temperature, relhumidity] of sock) {
    update_nbr += 1;
    total_temp += parseInt(temperature);

    console.log(
      `Receive temperature for zipcode '${zip_filter}' was ${temperature} F`
    );

    if (update_nbr == 5) {
      break;
    }
  }

  console.log(
    `Average temperature for zipcode '${zip_filter}' was ${
      total_temp / update_nbr
    } F`
  );
}

run();

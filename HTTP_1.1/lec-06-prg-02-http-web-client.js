const axios = require("axios");

(async function () {
  console.log("## HTTP client started.");

  console.log("## GET request for http://localhost:8080/temp/");
  http_request = await axios.get("http://localhost:8080/temp/");
  console.log("## GET response [start]");
  console.log(http_request.data);
  console.log("## GET response [end]");

  console.log("## GET request for http://localhost:8080/?var1=9&var2=9");
  http_request = await axios.get("http://localhost:8080/?var1=9&var2=9");
  console.log("## GET response [start]");
  console.log(http_request.data);
  console.log("## GET response [end]");

  console.log(
    "## POST request for http://localhost:8080/ with var1 is 9 and var2 is 9"
  );
  http_request = await axios.post("http://localhost:8080", {
    data: { var1: "9", var2: "9" },
  });
  console.log("## POST response [start]");
  console.log(http_request.data);
  console.log("## POST response [end]");

  console.log("## HTTP client completed.");
})();

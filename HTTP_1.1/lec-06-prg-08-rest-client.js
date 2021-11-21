const axios = require("axios");

(async function () {
  // Reads a non registered member : error-case
  r = await axios.get("http://localhost:5000/membership_api/0001");

  console.log(
    "#1 Code:",
    r.status,
    ">>",
    "JSON:",
    r.data,
    ">>",
    "JSON Result:",
    r.data["0001"]
  );

  // Creates a new registered member : non-error case
  r = await axios.put("http://localhost:5000/membership_api/0001", {
    "0001": "apple",
  });
  console.log(
    "#2 Code:",
    r.status,
    ">>",
    "JSON:",
    r.data,
    ">>",
    "JSON Result:",
    r.data["0001"]
  );

  // Reads a registered member : non-error case
  r = await axios.get("http://localhost:5000/membership_api/0001");
  console.log(
    "#3 Code:",
    r.status,
    ">>",
    "JSON:",
    r.data,
    ">>",
    "JSON Result:",
    r.data["0001"]
  );

  // Creates an already registered member : error case
  r = await axios.put(
    "http://localhost:5000/membership_api/0001",
    (data = { "0001": "xpple" })
  );
  console.log(
    "#4 Code:",
    r.status,
    ">>",
    "JSON:",
    r.data,
    ">>",
    "JSON Result:",
    r.data["0001"]
  );

  // Updates a non registered member : error case
  r = await axios.post(
    "http://localhost:5000/membership_api/0002",
    (data = { "0002": "xrange" })
  );
  console.log(
    "#5 Code:",
    r.status,
    ">>",
    "JSON:",
    r.data,
    ">>",
    "JSON Result:",
    r.data["0002"]
  );

  // Updates a registered member : non-error case
  r = await axios.put("http://localhost:5000/membership_api/0002", {
    "0002": "xrange",
  });
  r = await axios.post("http://localhost:5000/membership_api/0002", {
    "0002": "orange",
  });
  console.log(
    "#6 Code:",
    r.status,
    ">>",
    "JSON:",
    r.data,
    ">>",
    "JSON Result:",
    r.data["0002"]
  );

  // Delete a registered member : non-error case
  r = await axios.delete("http://localhost:5000/membership_api/0001");
  console.log(
    "#7 Code:",
    r.status,
    ">>",
    "JSON:",
    r.data,
    ">>",
    "JSON Result:",
    r.data["0001"]
  );

  // Delete a non registered member : non-error case
  r = await axios.delete("http://localhost:5000/membership_api/0001");
  console.log(
    "#8 Code:",
    r.status,
    ">>",
    "JSON:",
    r.data,
    ">>",
    "JSON Result:",
    r.data["0001"]
  );
})();

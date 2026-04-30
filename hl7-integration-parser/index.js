const express = require("express");
const app = express();

app.use(express.text());

app.get("/", (req, res) => {
  res.send("HL7 Integration API is running");
});

function parseHL7(message) {
  const lines = message.split("\n");
  const data = {};

  lines.forEach(line => {
    const parts = line.split("|");
    const segment = parts[0];

    if (segment === "PID") {
      data.patient = {
        id: parts[3],
        name: parts[5]?.replace("^", " ")
      };
    }

    if (segment === "OBX") {
      if (!data.observations) {
        data.observations = [];
      }

      data.observations.push({
        test: parts[3],
        value: parts[5],
        unit: parts[6]
      });
    }
  }); // ✅ correct closing of forEach

  return data;
}

app.post("/parse", (req, res) => {
  const result = parseHL7(req.body);
  res.json(result);
});

app.listen(3000, () => console.log("Server running on port 3000"));
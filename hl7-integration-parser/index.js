const express = require("express");
const app = express();
const db = require("./db");

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
app.get("/labs/:patientId", (req, res) => {
  const { patientId } = req.params;

  db.all(
    `SELECT * FROM labs WHERE patient_id = ?`,
    [patientId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});
app.post("/parse", (req, res) => {
  const parsed = parseHL7(req.body);

  // Save each observation to DB
  if (parsed.observations && parsed.patient) {
    parsed.observations.forEach(obs => {
      db.run(
        `INSERT INTO labs (patient_id, test, value, unit) VALUES (?, ?, ?, ?)`,
        [parsed.patient.id, obs.test, obs.value, obs.unit],
        (err) => {
          if (err) {
            console.error("DB insert error:", err.message);
          }
        }
      );
    });
  }

  res.json(parsed);
});

app.listen(3000, () => console.log("Server running on port 3000"));
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./labs.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS labs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT,
      test TEXT,
      value TEXT,
      unit TEXT
    )
  `);
});

module.exports = db;
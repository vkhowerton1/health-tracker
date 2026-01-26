const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let checkins = [];

// Health check
app.get("/", (req, res) => {
  res.send("Health Tracker API is running");
});

// Save check-in
app.post("/api/symptoms", (req, res) => {
  const entry = {
    ...req.body,
    date: new Date().toISOString(),
  };

  checkins.push(entry);

  res.status(201).json({
    message: "Check-in saved",
    data: entry,
  });
});

// Get all check-ins
app.get("/api/checkins", (req, res) => {
  res.json(checkins);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
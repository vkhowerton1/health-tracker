const express = require('express');

const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('Health Tracker API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Temporary in-memory symptom data
let symptoms = [];

app.post("/api/symptoms", (req, res) => {
  const symptomEntry = req.body;

  symptoms.push({
    ...symptomEntry,
    date: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Symptom logged",
    data: symptomEntry,
  });
});
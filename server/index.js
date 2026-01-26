const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Temporary in-memory storage
let symptoms = [];

// Test route
app.get('/', (req, res) => {
  res.send('Health Tracker API is running');
});

// Save a daily check-in
app.post('/api/checkins', (req, res) => {
  const checkin = req.body;

  const isGoodDay =
    Number(checkin.overallScore) >= 7 &&
    Number(checkin.stressLevel) <= 4 &&
    Number(checkin.painLevel) <= 3;

  const entryWithDate = {
    ...checkin,
    isGoodDay,
    date: new Date().toISOString(),
  };

  symptoms.push(entryWithDate);

  res.status(201).json({
    message: 'Check-in saved',
    data: entryWithDate,
  });
});

// Get all check-ins
app.get('/api/checkins', (req, res) => {
  res.json(symptoms);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
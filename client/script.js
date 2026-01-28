const form = document.getElementById("checkin-form");
const insightsDiv = document.getElementById("insights");
const historyDiv = document.getElementById("history");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    breakfast: form.breakfast.value,
    lunch: form.lunch.value,
    dinner: form.dinner.value,
    snackType: form.snackType.value,
    waterIntake: form.waterIntake.value,
    overallScore: Number(form.overallScore.value),
    stressLevel: Number(form.stressLevel.value),
    painLevel: Number(form.painLevel.value),
    onCycle: form.onCycle?.checked || false,
    notes: form.notes.value,
  };

  await fetch("http://localhost:3001/api/symptoms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  form.reset();
  loadData();
});

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const average = (arr) =>
  arr.reduce((sum, val) => sum + val, 0) / arr.length;

async function loadData() {
  const res = await fetch("http://localhost:3001/api/checkins");
  const entries = await res.json();

  renderInsights(entries);
  renderHistory(entries);
}

function analyzeEntries(entries) {
  if (entries.length < 3) return [];

  const insights = [];

  const stressValues = entries.map(e => e.stressLevel);
  const painValues = entries.map(e => e.painLevel);

  const avgStress = average(stressValues);
  const avgPain = average(painValues);

  // Hydration mode
  const hydrationCounts = {};
  entries.forEach(e => {
    if (e.waterIntake) {
      hydrationCounts[e.waterIntake] =
        (hydrationCounts[e.waterIntake] || 0) + 1;
    }
  });

  const hydrationMode = Object.keys(hydrationCounts)
    .sort((a, b) => hydrationCounts[b] - hydrationCounts[a])[0];

  const highStressDays = entries.filter(e => e.stressLevel >= avgStress + 1);
  const lowPainDays = entries.filter(e => e.painLevel <= avgPain - 1);

  const lowHydrationDays = entries.filter(
    e => e.waterIntake && e.waterIntake !== hydrationMode
  );

  const cycleDays = entries.filter(e => e.onCycle);
  const nonCycleDays = entries.filter(e => !e.onCycle);

  const appearsOften = (subset) =>
    subset.length / entries.length >= 0.3;

  // Stress + Hydration
  const stressHydrationOverlap = highStressDays.filter(e =>
    lowHydrationDays.includes(e)
  );

  if (appearsOften(stressHydrationOverlap)) {
    insights.push({
      title: "Stress & Hydration",
      text:
        "Higher stress days often appear alongside lower hydration in your recent check-ins.",
    });
  }

  // Low pain patterns
  if (appearsOften(lowPainDays)) {
    insights.push({
      title: "Lower Pain Days",
      text:
        "Lower pain days often align with steadier hydration and more consistent meals.",
    });
  }

  // Cycle-aware insights
  if (cycleDays.length >= 2 && nonCycleDays.length >= 2) {
    const avgCycleStress = average(cycleDays.map(e => e.stressLevel));
    const avgNonCycleStress = average(nonCycleDays.map(e => e.stressLevel));

    if (avgCycleStress >= avgNonCycleStress + 1) {
      insights.push({
        title: "Cycle & Stress",
        text:
          "Stress levels appear slightly higher on cycle days in your recent data.",
      });
    }

    const avgCyclePain = average(cycleDays.map(e => e.painLevel));
    const avgNonCyclePain = average(nonCycleDays.map(e => e.painLevel));

    if (avgCyclePain >= avgNonCyclePain + 1) {
      insights.push({
        title: "Cycle & Pain",
        text:
          "Pain levels appear higher on some cycle days.",
      });
    }
  }

  return insights.slice(0, 3);
}

function renderInsights(entries) {
  insightsDiv.innerHTML = "";

  const insights = analyzeEntries(entries);

  if (!insights.length) {
    insightsDiv.innerHTML =
      "<p>Not enough data yet to identify early patterns.</p>";
    return;
  }

  insights.forEach(insight => {
    const card = document.createElement("div");
    card.className = "insight-card";

    card.innerHTML = `
      <strong>${insight.title}</strong>
      <p>${insight.text}</p>
      <small>Early pattern — observational only.</small>
    `;

    insightsDiv.appendChild(card);
  });
}

function renderHistory(entries) {
  historyDiv.innerHTML = "";

  entries.slice().reverse().forEach(entry => {
    const div = document.createElement("div");
    div.className = "history-card";

    div.innerHTML = `
      <strong>${formatDate(entry.date)}</strong><br/>
      🍽 ${entry.breakfast || "—"}, ${entry.lunch || "—"}, ${entry.dinner || "—"}<br/>
      😌 Stress: ${entry.stressLevel}/10 • 
      💢 Pain: ${entry.painLevel}/10 • 
      🩸 Cycle: ${entry.onCycle ? "Yes" : "No"} • 
      💧 ${entry.waterIntake || "—"} fl oz
    `;

    historyDiv.appendChild(div);
  });
}

loadData();
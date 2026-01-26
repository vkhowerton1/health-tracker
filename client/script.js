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

async function loadData() {
  const res = await fetch("http://localhost:3001/api/checkins");
  const entries = await res.json();

  renderInsights(entries);
  renderHistory(entries);
}

function renderInsights(entries) {
  insightsDiv.innerHTML = "";

  if (entries.length < 3) {
    insightsDiv.innerHTML =
      "<p>Check back after a few days to see early patterns.</p>";
    return;
  }

  const highStress = entries.filter(e => e.stressLevel >= 7);
  const lowPain = entries.filter(e => e.painLevel <= 3);

  if (highStress.length) {
    insightsDiv.innerHTML += `
      <div class="insight-card">
        <strong>Stress & Habits</strong>
        <p>Higher stress days often include more snacking or skipped meals.</p>
        <small>Early pattern — observational only.</small>
      </div>
    `;
  }

  if (lowPain.length) {
    insightsDiv.innerHTML += `
      <div class="insight-card">
        <strong>Lower Pain Days</strong>
        <p>Lower pain days often align with hydration and consistent meals.</p>
        <small>Early pattern — gentle observation.</small>
      </div>
    `;
  }
}

function renderHistory(entries) {
  historyDiv.innerHTML = "";

  entries.slice().reverse().forEach(entry => {
    const div = document.createElement("div");
    div.className = "history-card";

    div.innerHTML = `
      <strong>${formatDate(entry.date)}</strong><br/>
      🍽 ${entry.breakfast || "—"}, ${entry.lunch || "—"}, ${entry.dinner || "—"}<br/>
      😌 Stress: ${entry.stressLevel}/10 • 💢 Pain: ${entry.painLevel}/10 • 💧 ${entry.waterIntake || "—"}
    `;

    historyDiv.appendChild(div);
  });
}

loadData();
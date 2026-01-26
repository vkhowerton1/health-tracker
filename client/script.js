const form = document.getElementById('checkin-form');
const checkinsDiv = document.getElementById('checkins');

async function loadCheckins() {
  try {
    const res = await fetch('http://localhost:3001/api/checkins');
    const data = await res.json();

    checkinsDiv.innerHTML = '';

    if (data.length === 0) {
      checkinsDiv.innerHTML = '<p>No check-ins yet.</p>';
      return;
    }

    data
      .slice()
      .reverse()
      .forEach(entry => {
        const details = document.createElement('details');
        details.className = 'checkin-card';

        const summary = document.createElement('summary');
        summary.innerHTML = `
          ${new Date(entry.date).toLocaleDateString()}
          ${entry.isGoodDay ? ' ✨' : ''}
        `;

        details.appendChild(summary);

        const content = document.createElement('div');
        content.className = 'checkin-content';

        content.innerHTML = `
          ${
            entry.isGoodDay
              ? '<p class="good-day">✨ Felt like a good day</p>'
              : ''
          }

          <p><strong>Meals</strong></p>
          <p>🍳 Breakfast: ${entry.breakfast || '—'}</p>
          <p>🥗 Lunch: ${entry.lunch || '—'}</p>
          <p>🍽 Dinner: ${entry.dinner || '—'}</p>

          <p><strong>Snacking:</strong> ${entry.snackType || '—'}</p>
          <p><strong>Water:</strong> ${entry.waterIntake || '—'} fl oz</p>

          <p><strong>Overall:</strong> ${entry.overallScore}/10</p>
          <p><strong>Stress:</strong> ${entry.stressLevel}/10</p>
          <p><strong>Pain:</strong> ${entry.painLevel}/10</p>

          <p><strong>Notes:</strong> ${entry.notes || '—'}</p>
        `;

        details.appendChild(content);
        checkinsDiv.appendChild(details);
      });
  } catch (err) {
    console.error('Failed to load check-ins', err);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    breakfast: form.breakfast.value,
    lunch: form.lunch.value,
    dinner: form.dinner.value,
    snackType: form.snackType.value,
    waterIntake: form.waterIntake.value,
    overallScore: form.overallScore.value,
    stressLevel: form.stressLevel.value,
    painLevel: form.painLevel.value,
    notes: form.notes.value
  };

  try {
    await fetch('http://localhost:3001/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    alert('Check-in saved 💛');
    form.reset();
    loadCheckins();
  } catch {
    alert('Something went wrong');
  }
});

loadCheckins();
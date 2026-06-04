/**
 * dashboard.js
 *
 * Reads 'token' and 'handle' from localStorage (persistent across tabs/sessions).
 * 'cf_token' remains in sessionStorage and is cleared separately on logout.
 */

import { getStats, getHistory } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {

  // ── 1. Auth guard ───────────────────────────────────────────────────────────
  // JWT lives in localStorage — survives tab/browser close for up to 5 days
  const token  = localStorage.getItem('token');
  const handle = localStorage.getItem('handle');

  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('user-handle').innerText = handle || '';

  // ── 2. Button listeners ─────────────────────────────────────────────────────

  document.getElementById('logout-btn').addEventListener('click', () => {
    // Clear both storages on explicit logout
    localStorage.removeItem('token');
    localStorage.removeItem('handle');
    sessionStorage.clear(); // clears cf_token and anything else
    window.location.href = 'index.html';
  });

  document.getElementById('create-room-btn').addEventListener('click', () => {
    window.location.href = 'create.html';
  });

  document.getElementById('join-room-btn').addEventListener('click', () => {
    const code = document.getElementById('room-code-input').value.trim();
    if (code) {
      window.location.href = `join.html?code=${code}`;
    } else {
      alert('Please enter a valid room code.');
    }
  });

  // ── 3. Stats ────────────────────────────────────────────────────────────────

  try {
    const stats = await getStats();
    document.getElementById('total-matches').innerText  = stats.total_matches  ?? 0;
    document.getElementById('total-wins').innerText     = stats.total_wins     ?? 0;
    document.getElementById('current-rating').innerText = stats.current_rating ?? 1200;
  } catch (err) {
    console.error('Failed to load stats:', err);
  }

  // ── 4. Match history ────────────────────────────────────────────────────────

  const historyList = document.getElementById('history-list');

  try {
    const res = await getHistory();

    if (res.history && res.history.length > 0) {
      historyList.innerHTML = '';
      res.history.forEach(match => {
        const li = document.createElement('li');
        li.className = `history-item ${match.outcome.toLowerCase()}`;
        const date = new Date(match.created_at).toLocaleDateString();
        li.innerHTML = `
          <div class="match-info">
            <strong>vs ${match.opponent_handle}</strong>
            <span class="problem-name">${match.problem_name} (${match.problem_rating})</span>
            <span class="match-date">${date}</span>
          </div>
          <div class="match-outcome ${match.outcome.toLowerCase()}">
            ${match.outcome.toUpperCase()}
          </div>
        `;
        historyList.appendChild(li);
      });
    } else {
      historyList.innerHTML = '<li>No matches played yet. Time to duel!</li>';
    }
  } catch (err) {
    console.error('Failed to load history:', err);
    historyList.innerHTML = '<li>Could not load match history.</li>';
  }
});
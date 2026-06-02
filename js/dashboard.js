// Run this immediately when the dashboard loads

import { createRoom, joinRoom, getRoom } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. The Security Check
    const token = sessionStorage.getItem('token');
    const handle = sessionStorage.getItem('handle');

    // If there is no token, kick the user back to the login screen!
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Display the user's name
    document.getElementById('user-handle').innerText = handle;

    // 2. Fetch and Display Fast-Stats
    try {
        const stats = await api.getStats();
        if (!stats.error) {
            document.getElementById('total-matches').innerText = stats.total_matches || 0;
            document.getElementById('total-wins').innerText = stats.total_wins || 0;
            document.getElementById('current-rating').innerText = stats.current_rating || 1200;
        }
    } catch (error) {
        console.error("Failed to load stats:", error);
    }

    // 3. Fetch and Render Match History
    try {
        const res = await api.getHistory();
        const historyList = document.getElementById('history-list');
        
        if (!res.error && res.history.length > 0) {
            historyList.innerHTML = ''; // Clear loading text
            
            res.history.forEach(match => {
                const li = document.createElement('li');
                // Add a CSS class based on if they won or lost
                li.className = `history-item ${match.outcome.toLowerCase()}`; 
                
                // Format the date nicely
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
            historyList.innerHTML = '<p>No matches played yet. Time to duel!</p>';
        }
    } catch (error) {
        console.error("Failed to load history:", error);
    }
});

// --- Actions ---

function logout() {
    // Destroy the token and kick them to login
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function createRoom() {
    // Redirects to your arena page and signals it to create a room
    window.location.href = 'arena.html?action=create';
}

function joinRoom() {
    const code = document.getElementById('room-code-input').value.trim();
    if (code) {
        // Redirects to arena and passes the room code in the URL
        window.location.href = `arena.html?room=${code}`;
    } else {
        alert("Please enter a valid room code.");
    }
}
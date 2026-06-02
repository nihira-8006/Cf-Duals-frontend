/**
 * api.js
 * Centralised REST layer for CF Duels.
 * All fetch() calls live here — no raw fetch() anywhere else.
 *
 * Auth:
 *   Backend returns sessionToken on create/join.
 *   We store it as cf_token in sessionStorage and attach it
 *   as  Authorization: Bearer <token>  on every request.
 */

const BASE_URL = 'https://cf-duals-backend-1.onrender.com/api';

// ── Internal fetch wrapper ────────────────────────────────────────────────────
const api = {
    // Helper to get the token for secure requests
    getAuthHeader: () => {
        const token = sessionStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },

    // --- Authentication ---
    register: async (handle, password) => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ handle, password })
        });
        return res.json();
    },

    login: async (handle, password) => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ handle, password })
        });
        return res.json();
    },

    // --- Protected Dashboard Data ---
    getStats: async () => {
        const res = await fetch(`${BASE_URL}/auth/stats`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                ...api.getAuthHeader() // Attaches the JWT lock-and-key
            }
        });
        return res.json();
    },

    getHistory: async () => {
        const res = await fetch(`${BASE_URL}/auth/history`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                ...api.getAuthHeader() 
            }
        });
        return res.json();
    }
  };

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };

  const token = sessionStorage.getItem('cf_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}

// ── Room endpoints ────────────────────────────────────────────────────────────

/**
 * Create a new duel room.
 * Backend returns: { roomId, roomCode, sessionToken }
 * FIX: backend key is sessionToken, not token.
 */
export async function createRoom({ handle, rating }) {
  const data = await request('POST', '/rooms/create', { handle, rating });
  if (data.sessionToken) sessionStorage.setItem('cf_token', data.sessionToken);
  return data;
}

/**
 * Join an existing duel room.
 * Backend returns: { roomId, participants, sessionToken, status }
 */
export async function joinRoom({ handle, roomCode }) {
  const data = await request('POST', '/rooms/join', { handle, roomCode });
  if (data.sessionToken) sessionStorage.setItem('cf_token', data.sessionToken);
  return data;
}

/**
 * Rehydrate arena state on load or refresh.
 * Uses roomCode — getRoomStatus service queries by code.
 * Returns: { roomId, roomCode, status, participants, problem?, winner? }
 */
export async function getRoom(roomCode) {
  return request('GET', `/rooms/${roomCode}`);
}
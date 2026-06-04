/**
 * api.js
 * Centralised REST layer for CF Duels.
 *
 * Two separate tokens:
 *  - 'token'    → JWT returned by /auth/login or /auth/register.
 *                 Identifies the user. Used for /auth/stats, /auth/history.
 *  - 'cf_token' → sessionToken returned by /rooms/create or /rooms/join.
 *                 Scoped to the current room session. Used for room endpoints.
 */

const BASE_URL = 'https://cf-duals-backend-1.onrender.com/api';

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Auth requests — attaches the user JWT ('token') */
async function authRequest(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

/** Room requests — attaches the room session token ('cf_token') */
async function roomRequest(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('cf_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Backend returns: { token, handle, ... }
 * Stores JWT as 'token'.
 */
export async function register(handle, password) {
  const data = await authRequest('POST', '/auth/register', { handle, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('handle', handle);
  }
  return data;
}

/**
 * Log in an existing user.
 * Backend returns: { token, handle, ... }
 * Stores JWT as 'token'.
 */
export async function login(handle, password) {
  const data = await authRequest('POST', '/auth/login', { handle, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('handle', handle);
  }
  return data;
}

/**
 * Get the logged-in user's stats.
 * Returns: { total_matches, total_wins, current_rating }
 */
export async function getStats() {
  return authRequest('GET', '/auth/stats');
}

/**
 * Get the logged-in user's match history.
 * Returns: { history: [{ opponent_handle, problem_name, problem_rating, outcome, created_at }] }
 */
export async function getHistory() {
  return authRequest('GET', '/auth/history');
}

// ── Room endpoints ────────────────────────────────────────────────────────────

/**
 * Create a new duel room.
 * Backend returns: { roomId, roomCode, sessionToken }
 * Stores room session token as 'cf_token'.
 */
export async function createRoom({ handle, rating }) {
  const data = await roomRequest('POST', '/rooms/create', { handle, rating });
  if (data.sessionToken) sessionStorage.setItem('cf_token', data.sessionToken);
  return data;
}

/**
 * Join an existing duel room.
 * Backend returns: { roomId, participants, sessionToken, status }
 * Stores room session token as 'cf_token'.
 */
export async function joinRoom({ handle, roomCode }) {
  const data = await roomRequest('POST', '/rooms/join', { handle, roomCode });
  if (data.sessionToken) sessionStorage.setItem('cf_token', data.sessionToken);
  return data;
}

/**
 * Rehydrate arena state on page load or refresh.
 * Returns: { roomId, roomCode, status, participants, problem?, winner? }
 */
export async function getRoom(roomCode) {
  return roomRequest('GET', `/rooms/${roomCode}`);
}
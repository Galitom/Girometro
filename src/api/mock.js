// API client for the Girometro Django backend.
// Each export mirrors what the screens already expect; shapes are produced
// server-side to match what this file used to return as mock data.
// (Filename kept as mock.js so existing imports keep working.)

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';

// --- JWT token storage -----------------------------------------------------
const ACCESS_KEY = 'giro_access';
const REFRESH_KEY = 'giro_refresh';

export const getToken = () => localStorage.getItem(ACCESS_KEY);
const getRefresh = () => localStorage.getItem(REFRESH_KEY);

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// --- low-level fetch helpers ----------------------------------------------
async function parse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, data });
  }
  return data;
}

function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

// Try once; on a 401 attempt a token refresh and replay the request.
async function request(path, options = {}, retry = true) {
  const res = await fetch(`${API}/${path}`, {
    ...options,
    headers: authHeaders(options.headers),
  });
  if (res.status === 401 && retry && getRefresh()) {
    const refreshed = await tryRefresh();
    if (refreshed) return request(path, options, false);
  }
  return parse(res);
}

async function tryRefresh() {
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: getRefresh() }),
    });
    if (!res.ok) { clearTokens(); return false; }
    const data = await res.json();
    setTokens({ access: data.access });
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

const get = (path) => request(path);
const post = (path, body) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// --- auth ------------------------------------------------------------------
export async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await parse(res);
  setTokens(data);
  return data;
}

export async function register({ username, password, name }) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, name }),
  });
  const data = await parse(res);
  setTokens(data);
  return data;
}

export const logout = () => clearTokens();

// --- data endpoints --------------------------------------------------------
export const getMe = () => get('me');
export const getGroup = () => get('group');
export const getPlayers = () => get('players');
export const getLastMatch = () => get('last-match');
export const getActivity = () => get('activity');
export const getStats = () => get('stats');
export const getLeagues = () => get('leagues');
export const getTournaments = () => get('tournaments');
export const getChat = () => get('chat');
export const getAchievements = () => get('achievements');

// RegistraModal passes player objects; the API wants their string ids (slugs).
export const submitMatch = (payload) =>
  post('matches', {
    mode: payload.mode,
    teamA: payload.teamA.map((p) => p.id),
    teamB: payload.teamB.map((p) => p.id),
    scoreA: payload.scoreA,
    scoreB: payload.scoreB,
  });

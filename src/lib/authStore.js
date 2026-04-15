import { STORAGE_KEY, SESSION_DURATION_MS } from '../config/auth.js';

/**
 * Read the current session from localStorage.
 * Returns { team, loggedInAt } or null if missing / expired.
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session || !session.team || !session.loggedInAt) return null;

    const elapsed = Date.now() - session.loggedInAt;
    if (elapsed > SESSION_DURATION_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Persist a new session after successful login.
 */
export function setSession(team) {
  const session = { team, loggedInAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

/**
 * Clear the stored session (logout).
 */
export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

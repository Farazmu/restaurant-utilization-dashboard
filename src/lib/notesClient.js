import { getSession } from './authStore.js';

let cache = null; // { [key]: string }

export async function getNotes() {
  if (cache) return cache;
  try {
    const res = await fetch('/api/notes');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cache = await res.json();
  } catch {
    cache = {};
  }
  return cache;
}

export async function saveNote(key, text) {
  try {
    const session = getSession();
    await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Team': session?.team ?? '',
      },
      body: JSON.stringify({ key, text }),
    });
    if (cache) {
      if (text && text.trim()) {
        cache[key] = text.trim();
      } else {
        delete cache[key];
      }
    }
  } catch {
    // silently fail — note will retry on next save
  }
}

export function invalidateCache() {
  cache = null;
}

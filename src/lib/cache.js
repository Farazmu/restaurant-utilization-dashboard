const CACHE_KEY = 'aio_restaurant_data';
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export function getCachedData() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.timestamp || !Array.isArray(parsed.data)) return null;
    return {
      data: parsed.data,
      timestamp: parsed.timestamp,
      isFresh: Date.now() - parsed.timestamp < CACHE_MAX_AGE_MS,
    };
  } catch {
    return null;
  }
}

export function setCachedData(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

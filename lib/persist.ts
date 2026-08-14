// Tiny localStorage persistence with schema-ish guard and size cap.
const KEY = "txj26:v1";
const MAX_BYTES = 200_000;

export function loadState<T>(): Partial<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as Partial<T>;
  } catch {
    return null;
  }
}

export function saveState<T>(state: T): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(state);
    if (raw.length > MAX_BYTES) return; // refuse to persist oversized payloads
    window.localStorage.setItem(KEY, raw);
  } catch {
    /* storage full or unavailable — non-fatal */
  }
}

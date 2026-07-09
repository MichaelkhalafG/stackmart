/**
 * Resolve the Laravel API base URL from NEXT_PUBLIC_API_URL — robustly, so the whole app hits
 * `/api/...` no matter how the env var is written (fix branch: fix/cors-and-api-url).
 *
 * Convention: NEXT_PUBLIC_API_URL is the API **host origin** (e.g. http://localhost:8000) and the
 * fetch layer appends `/api`. For resilience this also accepts a value that already includes `/api`
 * and/or a trailing slash — all of these normalize to `<origin>/api`:
 *   http://localhost:8000        → http://localhost:8000/api
 *   http://localhost:8000/       → http://localhost:8000/api
 *   http://localhost:8000/api    → http://localhost:8000/api
 *   http://localhost:8000/api/   → http://localhost:8000/api
 *
 * Env-driven only — no hardcoded host. Returns `undefined` when the env var is unset so callers
 * choose their own behavior (client wrapper throws; Server Components fail soft to empty results).
 */
export function apiBaseUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (!raw) return undefined;
  return /\/api$/i.test(raw) ? raw : `${raw}/api`;
}

/** Join the API base with a request path (leading slash optional). `undefined` if the base is unset. */
export function apiUrl(path: string): string | undefined {
  const base = apiBaseUrl();
  if (!base) return undefined;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

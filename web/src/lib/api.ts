import { useAuthStore } from "@/store/auth";

/** 422 validation shape from Laravel Form Requests: { field: ["msg", ...] } (12_API_Specification.md). */
export type ValidationErrors = Record<string, string[]>;

/** Normalized API error. Every non-2xx response from the wrapper throws one of these. */
export class ApiError extends Error {
  readonly status: number;
  readonly errors?: ValidationErrors;
  readonly payload?: unknown;

  constructor(status: number, message: string, errors?: ValidationErrors, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.payload = payload;
  }

  /** True when the API rejected input — `errors` holds the per-field messages for forms. */
  get isValidationError(): boolean {
    return this.status === 422;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * The single fetch wrapper that talks to the Laravel API (14/15_*.md).
 * - prefixes `NEXT_PUBLIC_API_URL`;
 * - attaches `Authorization: Bearer <token>` ONLY when a token is present (from the auth store);
 * - JSON by default; parses success/error JSON; surfaces the 422 `errors` map;
 * - on 401 clears the auth store and (client-side) redirects to /login.
 *
 * Client-side use only — Server Components fetch the API directly (08_Frontend_Architecture.md).
 * `path` is relative to the API base and should start with "/", e.g. api("/products").
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(0, "NEXT_PUBLIC_API_URL is not configured");
  }

  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // Parse body (tolerate empty 204 responses and non-JSON).
  let body: unknown = null;
  if (res.status !== 204) {
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
  }

  if (!res.ok) {
    // Standard unauthenticated path: clear auth and (client only) redirect to /login.
    // Skip the redirect on /auth/* calls so a failed login doesn't bounce the login page.
    if (res.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined" && !path.startsWith("/auth/")) {
        window.location.assign("/login");
      }
    }

    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
    const message =
      record && typeof record.message === "string" ? record.message : res.statusText || "Request failed";
    const errors =
      res.status === 422 && record && record.errors && typeof record.errors === "object"
        ? (record.errors as ValidationErrors)
        : undefined;

    throw new ApiError(res.status, message, errors, body);
  }

  return body as T;
}

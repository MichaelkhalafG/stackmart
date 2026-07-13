import { apiUrl } from "@/lib/apiBase";
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

/**
 * Build `FormData` for a multipart request (DR-8: POST /api/submissions carries files).
 *
 * Encodes values the way Laravel's validator expects to read them back:
 *   File                → images[] (repeated key, one entry per file)
 *   array of primitives → tech_stack[languages][]
 *   plain object        → metrics[mrr]
 *   boolean             → "1" / "0"   (Laravel's `accepted` rule reads "1")
 *   null / undefined    → omitted entirely (so `nullable` fields stay absent, not the string "null")
 *
 * Numbers become strings, which is fine: Laravel's `integer` rule accepts numeric strings.
 */
export function toFormData(payload: Record<string, unknown>): FormData {
  const form = new FormData();

  const append = (key: string, value: unknown): void => {
    if (value === null || value === undefined || value === "") return;

    if (value instanceof File || value instanceof Blob) {
      form.append(key, value);
      return;
    }

    if (Array.isArray(value)) {
      // Files and primitives alike are repeated under `key[]`.
      value.forEach((item) => append(`${key}[]`, item));
      return;
    }

    if (typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) =>
        append(`${key}[${childKey}]`, childValue),
      );
      return;
    }

    if (typeof value === "boolean") {
      form.append(key, value ? "1" : "0");
      return;
    }

    form.append(key, String(value));
  };

  Object.entries(payload).forEach(([key, value]) => append(key, value));

  return form;
}

/**
 * The single fetch wrapper that talks to the Laravel API (14/15_*.md).
 * - resolves the base via `apiUrl()` (NEXT_PUBLIC_API_URL origin → `/api`, trailing-slash safe);
 * - attaches `Authorization: Bearer <token>` ONLY when a token is present (from the auth store);
 * - JSON by default; parses success/error JSON; surfaces the 422 `errors` map;
 * - on 401 clears the auth store and (client-side) redirects to /login.
 *
 * MULTIPART (DR-8): pass a `FormData` body and the wrapper leaves `Content-Type` UNSET, so the
 * browser adds it along with the required multipart boundary. Setting it by hand would produce a
 * boundary-less header and the server would fail to parse any part. Everything else — auth header,
 * 422 mapping, 401 handling — is identical on both paths.
 *
 * Client-side use only — Server Components fetch the API directly (08_Frontend_Architecture.md).
 * `path` is relative to the API root and should start with "/", e.g. api("/products") → `<origin>/api/products`.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = apiUrl(path);
  if (!url) {
    throw new ApiError(0, "NEXT_PUBLIC_API_URL is not configured");
  }

  const isMultipart = typeof FormData !== "undefined" && init?.body instanceof FormData;

  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  // JSON by default — but NEVER for FormData: the browser must set the multipart boundary itself.
  if (init?.body !== undefined && !isMultipart && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (isMultipart) {
    headers.delete("Content-Type");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });

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

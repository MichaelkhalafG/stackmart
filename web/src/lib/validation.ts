/**
 * Shared client-side validators — one source of truth for every form's error COPY.
 *
 * The house style for a message: say what is wrong AND how to fix it, in plain language.
 *   ✗ "Invalid"                      ✓ "Enter a valid email like name@example.com"
 *   ✗ "This field is required"       ✓ "Enter your email address"
 *   ✗ "Must be > 0"                  ✓ "Asking price must be greater than $0"
 *
 * Each factory returns `(value) => string | undefined` — `undefined` means valid — so a form can use
 * the SAME validator for blur-time feedback and for the submit-time gate. Nothing here touches the
 * network: server 422s still win (they are mapped onto the same fields, in the same tone).
 */

export type Validator<T = string> = (value: T) => string | undefined;

/** Run validators in order and return the first failure — so a field shows one clear message. */
export function firstError<T>(value: T, ...validators: Array<Validator<T> | undefined>) {
  for (const validate of validators) {
    const message = validate?.(value);
    if (message) return message;
  }
  return undefined;
}

/** A non-empty string. `what` completes "Enter your …" / "Add a …". */
export const required = (message: string): Validator => (value) =>
  value.trim().length === 0 ? message : undefined;

/**
 * A pragmatic email shape check — one `@`, a dot in the domain, no spaces. Deliberately NOT an
 * RFC-complete regex: the server is the authority, this only catches obvious typos early.
 */
export const email = (): Validator => (value) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Enter your email address";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return "Enter a valid email like name@example.com";
  }
  return undefined;
};

export const minLength = (min: number, message: string): Validator => (value) =>
  value.length < min ? message : undefined;

export const maxLength = (max: number, message: string): Validator => (value) =>
  value.length > max ? message : undefined;

/** Passwords must match — pass the other field's current value. */
export const matches = (other: string, message = "Passwords don't match"): Validator => (value) =>
  value !== other ? message : undefined;

/** An https:// URL (the API accepts https only). Empty passes — pair with `required` if mandatory. */
export const httpsUrl = (message = "Enter a valid URL like example.com"): Validator => (value) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".")) return message;
    return undefined;
  } catch {
    return message;
  }
};

/**
 * A money amount typed in DOLLARS (the forms collect dollars and submit integer cents).
 * `min` is in dollars; pass 0 to allow "no revenue yet".
 */
export const money = ({
  min = 0,
  required: isRequired = false,
  label = "Amount",
}: {
  min?: number;
  required?: boolean;
  label?: string;
} = {}): Validator => (value) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return isRequired ? `Enter the ${label.toLowerCase()}` : undefined;
  }
  const amount = Number(trimmed.replace(/[$,\s]/g, ""));
  if (!Number.isFinite(amount)) return `${label} must be a number, like 12000`;
  if (amount < 0) return `${label} can't be negative`;
  if (isRequired && amount <= min) {
    return `${label} must be greater than $${min.toLocaleString("en-US")}`;
  }
  return undefined;
};

/** A whole, non-negative count (users, monthly traffic…). Empty passes. */
export const wholeNumber = (label: string): Validator => (value) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  const amount = Number(trimmed.replace(/[,\s]/g, ""));
  if (!Number.isFinite(amount)) return `${label} must be a number, like 1200`;
  if (amount < 0) return `${label} can't be negative`;
  if (!Number.isInteger(amount)) return `${label} must be a whole number`;
  return undefined;
};

/* ── File validators ───────────────────────────────────────────────────────────────────────── */

const MB = 1024 * 1024;

/** Human file size: 104857600 → "100 MB". */
export function formatBytes(bytes: number): string {
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** One file, restricted by extension + size. Returns a message naming BOTH limits when it fails. */
export function validateFile(
  file: File | null | undefined,
  {
    extensions,
    maxBytes,
    label,
  }: { extensions: string[]; maxBytes: number; label: string },
): string | undefined {
  if (!file) return undefined;

  const name = file.name.toLowerCase();
  const ok = extensions.some((ext) => name.endsWith(ext));
  if (!ok) {
    const list = extensions.join(", ");
    return `${label} must be a ${list} file (max ${formatBytes(maxBytes)})`;
  }
  if (file.size > maxBytes) {
    return `${file.name} is ${formatBytes(file.size)} — the limit is ${formatBytes(maxBytes)}`;
  }
  return undefined;
}

/** A list of files, restricted by count as well. */
export function validateFiles(
  files: File[],
  {
    extensions,
    maxBytes,
    maxCount,
    label,
  }: { extensions: string[]; maxBytes: number; maxCount: number; label: string },
): string | undefined {
  if (files.length > maxCount) {
    return `Add up to ${maxCount} ${label.toLowerCase()} — you selected ${files.length}`;
  }
  for (const file of files) {
    const message = validateFile(file, { extensions, maxBytes, label });
    if (message) return message;
  }
  return undefined;
}

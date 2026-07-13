"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { ChevronDown, FileText, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { controlBase } from "@/components/form/fieldStyles";
import { FileDrop } from "@/components/form/FileDrop";

/** Bytes → a short human size for the file chips (mono, like every other figure). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Native select — the reference's chevron select. A real <select> (no package),
   sharing `controlBase` so its default / focus / error / disabled states match
   every other control exactly.
   ───────────────────────────────────────────────────────────────────────────── */
export function NativeSelect({
  value,
  onChange,
  options,
  placeholder = "Choose one…",
  disabled = false,
  id,
  ...aria
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name="category_id"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(controlBase, "cursor-pointer appearance-none pr-10")}
        {...aria}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-fg-muted"
        strokeWidth={2.4}
        aria-hidden
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tag input — type a value, press Enter (or comma) to add it as a removable chip.
   Used for the three tech-stack groups. No package.
   ───────────────────────────────────────────────────────────────────────────── */
export function TagInput({
  id,
  values,
  onChange,
  placeholder,
  ...aria
}: {
  id?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    // Case-insensitive de-dupe, and cap at the server's 25-per-group limit.
    const exists = values.some((value) => value.toLowerCase() === tag.toLowerCase());
    if (exists || values.length >= 25) {
      setDraft("");
      return;
    }
    onChange([...values, tag]);
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      // Enter must add a tag, never submit the whole form.
      event.preventDefault();
      add(draft);
      return;
    }
    if (event.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        id={id}
        type="text"
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        className={controlBase}
        {...aria}
      />

      {values.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {values.map((tag) => (
            <li key={tag}>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-tag-bg px-2.5 py-1 text-xs font-semibold text-tag-fg">
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => onChange(values.filter((value) => value !== tag))}
                  className="text-tag-fg/60 transition-colors hover:text-tag-fg"
                >
                  <X className="size-3" strokeWidth={2.6} aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Single-file picker (the ZIP and the README): the dropzone + a chip showing the
   chosen file's name and size, with a remove control.
   ───────────────────────────────────────────────────────────────────────────── */
export function SingleFileField({
  file,
  onChange,
  accept,
  hint,
  invalid = false,
  accent = false,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  hint: string;
  invalid?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FileDrop
        accept={accept}
        hint={hint}
        accent={accent}
        invalid={invalid}
        showChosen={false}
        onFiles={(files) => onChange(files[0] ?? null)}
      />

      {file ? (
        <div className="flex items-center gap-2.5 rounded-md border border-border bg-canvas-subtle px-3 py-2">
          <FileText className="size-4 flex-none text-accent" strokeWidth={2.2} aria-hidden />
          <span className="min-w-0 flex-1 truncate text-[13px] text-fg">{file.name}</span>
          <span className="mono flex-none text-[11.5px] text-fg-muted">
            {formatBytes(file.size)}
          </span>
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            onClick={() => onChange(null)}
            className="flex-none text-fg-muted transition-colors hover:text-danger"
          >
            <X className="size-4" strokeWidth={2.4} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Image gallery picker: multi-select dropzone + thumbnail previews with remove.
   Object URLs are revoked on unmount / change so the page can't leak memory.
   ───────────────────────────────────────────────────────────────────────────── */
export function ImageGalleryField({
  images,
  onChange,
  max,
  invalid = false,
}: {
  images: File[];
  onChange: (images: File[]) => void;
  max: number;
  invalid?: boolean;
}) {
  // Derive the object URLs during render (no setState in an effect), then revoke the PREVIOUS batch
  // whenever the selection changes and on unmount — so the page can't leak blob URLs.
  const previews = useMemo(() => images.map((image) => URL.createObjectURL(image)), [images]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const full = images.length >= max;

  return (
    <div className="flex flex-col gap-3">
      <FileDrop
        accent
        multiple
        accept="image/jpeg,image/png,image/webp"
        label={full ? "Maximum reached —" : "Drop images or"}
        hint={`JPG · PNG · WEBP · up to 5 MB each · ${images.length}/${max}`}
        invalid={invalid}
        showChosen={false}
        onFiles={(files) => onChange([...images, ...files].slice(0, max))}
      />

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={`${image.name}-${image.size}-${index}`}
              className="group/thumb relative overflow-hidden rounded-md border border-border bg-canvas-subtle"
            >
              <div className="aspect-[4/3] w-full">
                {previews[index] ? (
                  // A local object URL — next/image would need a loader for blob: sources.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previews[index]}
                    alt={image.name}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>

              <button
                type="button"
                aria-label={`Remove ${image.name}`}
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-md bg-primary/80 text-canvas transition-colors hover:bg-danger"
              >
                <X className="size-3.5" strokeWidth={2.6} aria-hidden />
              </button>

              <p className="mono truncate px-2 py-1.5 text-[10.5px] text-fg-muted">
                {formatBytes(image.size)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

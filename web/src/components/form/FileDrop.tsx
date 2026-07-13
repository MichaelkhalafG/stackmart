"use client";

import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * File upload dropzone — Forms & Utility reference §02/§03.
 *
 * Dashed border on a tinted fill; the whole zone is a label wrapping a real <input type="file">,
 * so clicking or keyboard-activating it opens the picker with no package. Dragging over switches
 * it to the royal-blue/lavender "active" treatment (the reference's hover state).
 *
 * `accent` renders the emphasised lavender variant used inside the Sell form; the default is the
 * quieter canvas-subtle variant from the component gallery.
 */
export function FileDrop({
  label = "Drag & drop, or",
  hint = "any file · max 5 MB",
  accent = false,
  multiple = false,
  accept,
  onFiles,
  className,
}: {
  label?: string;
  hint?: string;
  accent?: boolean;
  multiple?: boolean;
  accept?: string;
  /** Called with the chosen/dropped files. Purely presentational otherwise — no upload here. */
  onFiles?: (files: File[]) => void;
  className?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);

  function accept_(files: FileList | null) {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    setChosen(list.map((file) => file.name));
    onFiles?.(list);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    accept_(event.dataTransfer?.files ?? null);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    accept_(event.target.files);
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "block cursor-pointer rounded-lg border-[1.5px] border-dashed p-5 text-center transition-colors",
        "focus-within:ring-[3px] focus-within:ring-accent/25",
        accent ? "border-accent bg-tag-bg" : "border-border bg-canvas-subtle",
        dragging && "border-accent bg-tag-bg",
        className,
      )}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={onChange}
        className="sr-only"
      />

      {accent ? (
        <span className="mx-auto mb-2.5 flex size-10 items-center justify-center rounded-lg border border-accent/25 bg-canvas">
          <Upload className="size-5 text-accent" strokeWidth={2.2} aria-hidden />
        </span>
      ) : null}

      <span className="block text-[13.5px] font-semibold text-primary">
        {label} <span className="text-accent">browse</span>
      </span>
      <span className="mono mt-1 block text-[11.5px] text-fg-muted">
        {chosen.length > 0 ? chosen.join(" · ") : hint}
      </span>
    </label>
  );
}

"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { apiUrl } from "@/lib/apiBase";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";

/**
 * Download a purchased product's deliverable (S4.05/S4.06). The download endpoint
 * (`GET /api/orders/{id}/download`) requires a Sanctum Bearer token, which a plain anchor
 * cannot send — so this fetches the ZIP WITH the `Authorization` header and triggers a
 * client-side download from the blob. Reused by the success page + the purchases table.
 */
export function DownloadButton({
  orderId,
  label = "Download",
  filename,
}: {
  orderId: number;
  label?: string;
  filename?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleDownload() {
    setError(undefined);
    const url = apiUrl(`/orders/${orderId}/download`);
    if (!url) {
      setError("Downloads are unavailable right now.");
      return;
    }

    setPending(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(String(res.status));
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename ?? `order-${orderId}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("Couldn't download the file. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={handleDownload} disabled={pending}>
        <Download aria-hidden />
        {pending ? "Preparing…" : label}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

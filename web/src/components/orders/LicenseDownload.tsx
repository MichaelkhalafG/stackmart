"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Download, KeyRound, ShieldCheck } from "lucide-react";

import { api } from "@/lib/api";
import { apiUrl } from "@/lib/apiBase";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/components/product/MarketplaceCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/form/Field";
import { Shimmer } from "@/components/states/LoadingState";
import { cn } from "@/lib/utils";
import type { OrderDetail } from "@/components/checkout/CheckoutSuccess";

/**
 * The license-gated download page (`/download/{orderId}`).
 *
 * The deliverable is NOT released on click. The buyer must present the license key from their
 * purchase confirmation, which the API verifies (constant-time) ON TOP OF the checks it already
 * enforced: Sanctum auth + ownership of the order + the order being paid. This page is only the
 * door — the API is the authority, so nothing here can be bypassed by editing the client.
 *
 * On success the API streams the ZIP; we read it as a blob and trigger the save with the filename
 * the server sends. A wrong key returns 422 and the message is shown under the field — no file, and
 * the API does not count it as a download.
 */
export function LicenseDownload({ orderId }: { orderId: number }) {
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const query = useQuery({
    queryKey: ["order", String(orderId)],
    queryFn: () => api<{ data: OrderDetail }>(`/orders/${orderId}`),
    retry: 1,
  });

  const order = query.data?.data;

  async function handleDownload(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);

    if (licenseKey.trim() === "") {
      setError("Enter the license key from your purchase confirmation email.");
      return;
    }

    const url = apiUrl(`/orders/${orderId}/download`);
    if (!url) {
      setError("Downloads are unavailable right now.");
      return;
    }

    setPending(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ license_key: licenseKey.trim() }),
      });

      if (!res.ok) {
        setError(await messageForFailure(res));
        return;
      }

      // Success — the API streamed the ZIP.
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filenameFrom(
        res.headers.get("Content-Disposition"),
        `${order?.product.slug ?? `order-${orderId}`}.zip`,
      );
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setDone(true);
    } catch {
      setError("Couldn't reach the download service. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (query.isPending) {
    return (
      // Mirrors the loaded layout's width + two columns, so the page doesn't jump.
      <div className="w-full" aria-busy="true" aria-label="Loading">
        <Shimmer className="h-6 w-40" />
        <Shimmer className="mt-8 h-12 w-full max-w-[480px]" delay="0.08s" />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Shimmer className="h-72 w-full rounded-xl" delay="0.16s" />
          <Shimmer className="h-72 w-full rounded-xl" delay="0.22s" />
        </div>
      </div>
    );
  }

  if (query.isError || !order) {
    return (
      <div className="mx-auto w-full max-w-[520px] rounded-xl border border-border bg-canvas p-6 text-center sm:p-8">
        <h1 className="text-[1.35rem] font-bold text-primary">We couldn&rsquo;t find that order</h1>
        <p className="mt-2 text-[14.5px] text-fg-muted">
          It may belong to another account. Check your purchases and try again.
        </p>
        <Link
          href="/account/purchases"
          className={cn(buttonVariants({ variant: "outline" }), "mt-6 w-full sm:w-auto")}
        >
          Go to your purchases
        </Link>
      </div>
    );
  }

  return (
    // Full container width — a two-column composition, not a small form in empty space.
    <div className="w-full">
      {/* The navbar already carries the logo — this row is just the license-gate chip. */}
      <span className="mono inline-flex items-center gap-2 rounded-md border border-border bg-canvas px-2.5 py-1.5 text-[11px] text-fg-muted">
        <ShieldCheck className="size-3.5 text-accent" strokeWidth={2.4} aria-hidden />
        license required
      </span>

      <h1 className="mt-4 text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight font-bold tracking-[-0.02em] text-primary">
        Download your product
      </h1>
      <p className="mt-2.5 max-w-[62ch] text-[15px] leading-[1.55] text-fg-muted">
        Your source code is released only to the license holder. Enter the key from your purchase
        confirmation to unlock the download.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
        {/* ── Left: the gate ───────────────────────────────────────────────── */}
        <div className="flex flex-col rounded-xl border border-border bg-canvas p-6 sm:p-8">
          {done ? (
            <Alert variant="success" title="Your download has started" className="mb-5">
              If nothing happened, enter your key and try again — your license stays valid.
            </Alert>
          ) : null}

          <form onSubmit={handleDownload} noValidate className="flex flex-1 flex-col gap-4">
            <Field
              label="License key"
              required
              error={error}
              helper="Enter the license key from your purchase confirmation email to download your product."
              tooltip="Your license key proves this copy is a paid one. We ask for it on every download, on top of your sign-in — so a stolen session alone can't take your source code."
            >
              {(fieldProps) => (
                /*
                  A 19-char key (and the "XXXX-XXXX-XXXX-XXXX" placeholder) has to fit the field at
                  360px, so the mono size and letter-spacing step down below `sm` and return to the
                  unchanged desktop treatment from `sm` up.
                */
                <Input
                  {...fieldProps}
                  name="license_key"
                  value={licenseKey}
                  onChange={(event) => setLicenseKey(event.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  autoComplete="off"
                  spellCheck={false}
                  className="mono text-[14px] tracking-[0.04em] uppercase sm:text-[1.05rem] sm:tracking-[0.1em]"
                />
              )}
            </Field>

            {/* Convenience: the key is already in the buyer's own order data — still an explicit act. */}
            {order.license_key && licenseKey.trim() === "" ? (
              <button
                type="button"
                onClick={() => setLicenseKey(order.license_key ?? "")}
                className="mono flex min-h-11 items-center self-start text-[12px] font-semibold text-accent hover:underline sm:block sm:min-h-0"
              >
                <KeyRound className="mr-1 inline size-3.5" aria-hidden />
                Use the key from this purchase
              </button>
            ) : null}

            <div className="mt-auto pt-2">
              <Button type="submit" size="lg" block loading={pending}>
                {pending ? null : <Download className="size-4" aria-hidden />}
                {pending ? "Verifying your license…" : "Verify & download"}
              </Button>

              <Link
                href="/account/purchases"
                className={cn(buttonVariants({ variant: "ghost" }), "mt-2 w-full")}
              >
                Back to your purchases
              </Link>
            </div>
          </form>
        </div>

        {/* ── Right: the branded product / terminal panel ───────────────────── */}
        <div className="panel-navy relative overflow-hidden rounded-xl">
          <div className="motif-grid absolute inset-0" aria-hidden />

          <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
            <div>
              <span className="mono inline-flex items-center gap-2 rounded-md border border-tag-bg/30 bg-tag-bg/15 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-tag-bg uppercase">
                <ShieldCheck className="size-3.5" strokeWidth={2.4} aria-hidden />
                Licensed delivery
              </span>

              <h2 className="mt-5 text-[1.35rem] leading-tight font-bold tracking-[-0.01em] break-words text-canvas sm:text-[1.6rem]">
                {order.product.title}
              </h2>
              <p className="mono mt-2 text-[13px] break-words text-canvas/70">
                order #{order.id} · {formatPrice(order.amount_cents, order.currency)}
              </p>
            </div>

            {/* Coding-terminal motif: the four gates the API enforces on every download. */}
            <div className="mono mt-8 rounded-lg border border-tag-bg/20 bg-primary-emphasis/55 px-4 py-4 text-[12px] leading-[1.9]">
              <div className="text-tag-bg/55">{"// release checks"}</div>
              <div className="text-canvas">
                <span className="text-tag-bg">signed_in</span> = true
              </div>
              <div className="text-canvas">
                <span className="text-tag-bg">owns_order</span> = true
              </div>
              <div className="text-canvas">
                <span className="text-tag-bg">paid</span> = true
              </div>
              <div className="text-canvas">
                <span className="text-tag-bg">license</span> ={" "}
                <span className="text-canvas/60">awaiting…</span>
                <span
                  aria-hidden
                  className="anim-blink ml-1 inline-block h-3 w-1.5 -translate-y-px bg-tag-bg align-middle"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Turn a failed download into a message that says what actually went wrong. */
async function messageForFailure(res: Response): Promise<string> {
  if (res.status === 422) {
    // The API's own message ("That license key doesn't match this order…") — never the real key.
    try {
      const body = (await res.json()) as { errors?: { license_key?: string[] }; message?: string };
      return (
        body.errors?.license_key?.[0] ??
        body.message ??
        "That license key doesn't match this order — check your confirmation email."
      );
    } catch {
      return "That license key doesn't match this order — check your confirmation email.";
    }
  }
  if (res.status === 401) return "Your session expired. Sign in again to download.";
  if (res.status === 403) return "This download isn't available for your account or this order.";
  if (res.status === 404) {
    return "The file for this product hasn't been uploaded yet. Our team has been notified — your license key stays valid.";
  }
  if (res.status === 429) return "Too many attempts. Wait a minute and try again.";
  return "Couldn't download the file. Please try again.";
}

/** Prefer the filename the server sends (Content-Disposition), then a fallback. */
function filenameFrom(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match?.[1] ? decodeURIComponent(match[1]) : fallback;
}

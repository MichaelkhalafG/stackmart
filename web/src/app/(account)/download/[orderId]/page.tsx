import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LicenseDownload } from "@/components/orders/LicenseDownload";

export const metadata: Metadata = {
  title: "Download your product",
  robots: { index: false, follow: false },
};

/**
 * `/download/{orderId}` — the license-gated download page.
 *
 * It lives inside the `(account)` route group, so it inherits the existing auth guard (an anonymous
 * visitor is redirected to /login) and the site chrome. The guard is a convenience, NOT the
 * security boundary: the API independently enforces Sanctum auth + ownership + paid + a matching
 * license key on every download request.
 */
export default async function DownloadPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const id = Number(orderId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  return <LicenseDownload orderId={id} />;
}

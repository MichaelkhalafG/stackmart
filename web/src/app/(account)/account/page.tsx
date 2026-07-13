"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useAuthStore } from "@/store/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Account profile (S3.05) — reads the authenticated user from the Zustand store and shows a
 * simple profile (name, email, admin badge). Renders INSIDE the S3.03 `(account)/layout.tsx`
 * guard, so by the time this mounts the store is hydrated and a token is present; `user` is
 * set alongside the token, but we still render defensively. Client component (authenticated
 * page — 08_Frontend_Architecture.md).
 */
export default function AccountPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="py-2">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Your account</h1>
        <p className="text-sm text-fg-muted">Manage your MDN STACKMART profile and purchases.</p>
      </header>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {user?.name ?? "Your profile"}
            {user?.is_admin ? <Badge>Admin</Badge> : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-fg-muted">Name</dt>
              <dd className="font-medium text-fg">{user?.name ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-fg-muted">Email</dt>
              <dd className="font-medium text-fg">{user?.email ?? "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Link
        href="/account/purchases"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
      >
        View your purchases
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

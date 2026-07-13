"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { api } from "@/lib/api";
import { useAuthStore, type User } from "@/store/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** First+last initial for the avatar button (no user images — a simple initials avatar). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/**
 * UserMenu (S5.07) — the signed-in header control: an initials avatar (shadcn DropdownMenu trigger,
 * matching the S1.05 round-button style) opening a menu with the user's name/email + Account /
 * Purchases links and a Sign out action. Rendered ONLY when a user is present (the Header branches
 * after hydration), so it never appears in the server HTML.
 *
 * Sign out calls the frozen `POST /api/auth/logout` (revokes the current Bearer token) via
 * `lib/api.ts`, then `clearAuth()` + redirect home. The API call is best-effort: if it fails (e.g.
 * the token is already invalid — the wrapper also clears on 401), we STILL `clearAuth()` locally so
 * the user is always signed out. `/auth/*` paths skip the wrapper's 401→/login bounce.
 */
export function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Best-effort: token may already be invalid. Clear locally regardless (below).
    } finally {
      clearAuth();
      router.replace("/");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="ml-1 inline-flex size-8 items-center justify-center rounded-full border border-border bg-canvas text-xs font-semibold text-fg-muted transition-colors hover:bg-muted hover:text-fg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {initials(user.name)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {/*
          `DropdownMenuLabel` is Base UI's `Menu.GroupLabel`: it reads MenuGroupContext and THROWS
          ("MenuGroupContext is missing") unless it is inside a `Menu.Group` (`DropdownMenuGroup`).
          So the identity label + the account links it names live in one group. Sign out is a
          standalone item (plain `Menu.Item` needs no group).
        */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate font-medium text-fg">{user.name}</span>
            <span className="truncate text-xs font-normal text-fg-muted">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/account" />}>Your account</DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account/purchases" />}>
            Your purchases
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} disabled={signingOut}>
          <LogOut className="size-4" aria-hidden />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

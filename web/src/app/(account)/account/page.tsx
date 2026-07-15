"use client";

import { useAuthStore } from "@/store/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileCard } from "@/components/account/ProfileCard";
import { AccountStats } from "@/components/account/AccountStats";
import { EditNameForm } from "@/components/account/EditNameForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

/**
 * Account dashboard — the signed-in user's profile and the two things they can actually change:
 * their display name (`PATCH /auth/profile`) and their password (`PATCH /auth/password`).
 *
 * Renders INSIDE the `(account)/layout.tsx` guard, so by the time this mounts the store is hydrated
 * and a token is present; `user` is set alongside the token, but we still render defensively rather
 * than assert. The 1280px container is supplied by the layout — this page only owns the composition:
 * settings on the left where the reading starts, identity + purchases in a sidebar on the right,
 * stacking to one column on mobile.
 *
 * There is deliberately NO logo lockup in the page body: the navbar above already carries it, and a
 * second one only pushed the actual account content below the fold.
 */
export default function AccountPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="py-2">
      <header className="mb-7">
        <h1 className="text-[clamp(1.6rem,2.4vw,2rem)] leading-tight font-bold tracking-[-0.02em] text-primary">
          Your account
        </h1>
        <p className="mt-1.5 text-[14.5px] text-fg-muted">
          Manage your MDN STACKMART profile, password, and purchases.
        </p>
      </header>

      {user ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {/* Settings — what the user came here to DO. */}
          <div className="flex flex-col gap-6">
            <EditNameForm key={user.id} user={user} />
            <ChangePasswordForm />
          </div>

          {/* Identity + purchases. Sticky on desktop so it stays in view beside the long forms. */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
            <ProfileCard user={user} />
            <AccountStats />
          </aside>
        </div>
      ) : (
        <AccountSkeleton />
      )}
    </div>
  );
}

/** Mirrors the loaded two-column layout, so nothing jumps if the store is momentarily empty. */
function AccountSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" aria-busy="true" aria-label="Loading your account">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[236px] w-full rounded-xl" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    </div>
  );
}

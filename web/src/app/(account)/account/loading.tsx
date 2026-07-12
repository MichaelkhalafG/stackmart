import { Skeleton } from "@/components/ui/skeleton";

/**
 * Account profile loading skeleton (S5.02) — mirrors the heading + profile card while the client
 * reads the auth store. shadcn `Skeleton` as-is + 06_UI_System.md tokens.
 */
export default function AccountLoading() {
  return (
    <div className="py-2" aria-busy="true" aria-label="Loading account">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="flex flex-col gap-4 rounded-md border border-border p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-56 max-w-full" />
        <Skeleton className="h-4 w-48 max-w-full" />
      </div>
    </div>
  );
}

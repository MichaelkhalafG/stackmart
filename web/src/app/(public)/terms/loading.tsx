import { LoadingState } from "@/components/states/LoadingState";

/**
 * `/terms` loading — the reference §04 loading card (spinner ring + mono terminal line + shimmer
 * bars). The (public) group has no section layout, so this supplies its own page container.
 */
export default function TermsLoading() {
  return (
    <div className="container-page py-16" aria-busy="true" aria-label="Loading">
      <LoadingState label="loading terms" className="mx-auto max-w-xl" />
    </div>
  );
}

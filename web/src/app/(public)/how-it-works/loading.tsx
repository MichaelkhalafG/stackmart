import { LoadingState } from "@/components/states/LoadingState";

/**
 * `/how-it-works` loading — the reference §04 loading card (spinner ring + mono terminal line +
 * shimmer bars). The (public) group has no section layout, so this supplies its own page container.
 */
export default function HowItWorksLoading() {
  return (
    <div className="container-page py-16" aria-busy="true" aria-label="Loading">
      <LoadingState label="loading how it works" className="mx-auto max-w-xl" />
    </div>
  );
}

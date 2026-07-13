import { Shimmer, TerminalLine } from "@/components/states/LoadingState";

/**
 * Listing detail loading skeleton — mirrors the repo-page layout (header row + content left +
 * sticky purchase card right) so the server fetch of `GET /api/products/{slug}` doesn't jump.
 * The listing layout supplies the page container. Reference §04 shimmer + mono terminal line.
 */
export default function ListingLoading() {
  return (
    <div className="py-2" aria-busy="true" aria-label="Loading listing">
      {/* Header row */}
      <div className="flex flex-col gap-3 border-b border-border pb-6">
        <Shimmer className="h-5 w-24" />
        <Shimmer className="h-9 w-2/3 max-w-lg" delay="0.08s" />
        <Shimmer className="h-4 w-1/2 max-w-md" delay="0.16s" />
      </div>

      {/* Content left, sticky purchase card right */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Shimmer className="aspect-[16/9] w-full" />
          <Shimmer className="h-5 w-40" delay="0.08s" />
          <Shimmer className="h-4 w-full" delay="0.16s" />
          <Shimmer className="h-4 w-5/6" delay="0.24s" />
          <Shimmer className="h-4 w-4/6" delay="0.32s" />
        </div>
        <div className="flex flex-col gap-3 rounded-md border border-border p-4">
          <TerminalLine>loading listing</TerminalLine>
          <Shimmer className="h-8 w-28" delay="0.08s" />
          <Shimmer className="h-10 w-full" delay="0.16s" />
          <Shimmer className="h-10 w-full" delay="0.24s" />
        </div>
      </div>
    </div>
  );
}

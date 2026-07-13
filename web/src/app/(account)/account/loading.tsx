import { Shimmer, TerminalLine } from "@/components/states/LoadingState";

/**
 * Account profile loading skeleton — mirrors the heading + profile card while the client reads the
 * auth store. The (account) layout supplies the page container. Reference §04 shimmer + terminal.
 */
export default function AccountLoading() {
  return (
    <div className="py-2" aria-busy="true" aria-label="Loading account">
      <div className="mb-6 flex flex-col gap-2">
        <Shimmer className="h-8 w-40" />
        <Shimmer className="h-4 w-72 max-w-full" delay="0.1s" />
      </div>
      <div className="flex max-w-md flex-col gap-4 rounded-md border border-border bg-canvas p-6">
        <TerminalLine>loading your profile</TerminalLine>
        <Shimmer className="h-4 w-56 max-w-full" delay="0.08s" />
        <Shimmer className="h-4 w-48 max-w-full" delay="0.16s" />
      </div>
    </div>
  );
}

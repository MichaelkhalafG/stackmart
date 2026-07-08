// Loading skeleton stub (S1.03 scaffold). Real page implementation lands in Day 2+.
export default function Loading() {
  return (
    <div className="animate-pulse p-6" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 rounded-md bg-muted" />
      <div className="mt-4 h-4 w-full max-w-2xl rounded bg-muted" />
      <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
    </div>
  );
}

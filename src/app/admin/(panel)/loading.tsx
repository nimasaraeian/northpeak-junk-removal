/**
 * Instant navigation feedback for every panel route.
 *
 * All panel pages are `force-dynamic` (live data + session), so without a
 * loading boundary a click on the nav freezes the current page until the next
 * one finishes querying the database. This skeleton lets the router swap the
 * content area immediately, so navigation feels instant even while the real
 * data is still loading.
 */
export default function PanelLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse" aria-hidden>
      <div className="h-3 w-24 rounded bg-[var(--ops-border-strong)]/60" />
      <div className="mt-2 h-6 w-48 rounded bg-[var(--ops-border-strong)]/50" />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="ops-card p-4">
            <div className="h-3 w-20 rounded bg-[var(--ops-border-strong)]/50" />
            <div className="mt-3 h-7 w-24 rounded bg-[var(--ops-border-strong)]/40" />
          </div>
        ))}
      </div>

      <div className="ops-card mt-4 overflow-hidden">
        <div className="border-b border-[var(--ops-border)] px-4 py-3">
          <div className="h-4 w-32 rounded bg-[var(--ops-border-strong)]/50" />
        </div>
        <div className="divide-y divide-[var(--ops-border)]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-4 flex-1 rounded bg-[var(--ops-border-strong)]/35" />
              <div className="h-4 w-20 rounded bg-[var(--ops-border-strong)]/30" />
              <div className="h-4 w-16 rounded bg-[var(--ops-border-strong)]/25" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

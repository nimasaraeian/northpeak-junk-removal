import { envRequirements } from "@/lib/admin/config";

/**
 * Shown instead of the panel when a required environment variable is missing.
 *
 * The brief calls for a friendly setup screen rather than a crash, and the
 * useful version of friendly is specific: which variable, what it is for, and
 * whether the panel can run without it.
 */
export function SetupScreen() {
  const requirements = envRequirements();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-16">
      <p className="ops-label">NorthPeak Ops</p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--ops-navy)]">
        Almost there — a couple of environment variables to set.
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--ops-muted)]">
        The panel needs these on the deployment before it can store anything. Add them in the
        Vercel project settings, then redeploy.
      </p>

      <ul className="mt-8 grid gap-3">
        {requirements.map((item) => (
          <li key={item.name} className="ops-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded bg-[var(--ops-surface-2)] px-2 py-1 font-mono text-sm font-semibold text-[var(--ops-navy)]">
                {item.name}
              </code>
              <span
                className="ops-pill"
                data-status={item.present ? "won" : item.required ? "lost" : "draft"}
              >
                {item.present ? "Set" : item.required ? "Required — missing" : "Optional — not set"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--ops-muted)]">{item.description}</p>
          </li>
        ))}
      </ul>

      <div className="ops-card mt-8 p-4">
        <p className="ops-label">Then</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ops-muted)]">
          Apply <code className="font-mono">drizzle/0000_northpeak_ops.sql</code> to the Neon
          branch — <code className="font-mono">npm run db:push</code> — which creates the three
          tables and seeds the pricing defaults and the item catalog.
        </p>
      </div>
    </div>
  );
}

import { envRequirements } from "@/lib/admin/config";
import { getT } from "@/lib/i18n/server";

/**
 * Shown instead of the panel when a required environment variable is missing.
 *
 * The brief calls for a friendly setup screen rather than a crash, and the
 * useful version of friendly is specific: which variable, what it is for, and
 * whether the panel can run without it.
 */
export async function SetupScreen() {
  const t = await getT();
  const requirements = envRequirements();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-16">
      <p className="ops-label">NorthPeak Ops</p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--ops-navy)]">
        {t("Almost there — a couple of environment variables to set.")}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--ops-muted)]">
        {t("The panel needs these on the deployment before it can store anything. Add them in the Vercel project settings, then redeploy.")}
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
                {item.present ? t("Set") : item.required ? t("Required — missing") : t("Optional — not set")}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--ops-muted)]">{item.description}</p>
          </li>
        ))}
      </ul>

      <div className="ops-card mt-8 p-4">
        <p className="ops-label">{t("Then")}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ops-muted)]">
          {t("Then apply the base migration to the Neon branch, which creates the tables and seeds the pricing defaults and item catalog.")}
        </p>
      </div>
    </div>
  );
}

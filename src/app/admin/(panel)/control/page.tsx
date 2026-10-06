import { ControlQueue } from "@/components/admin/ControlQueue";
import { GuardrailNote } from "@/components/admin/GuardrailNote";
import { loadControlData } from "@/lib/admin/control-data";
import { GUARDRAILS } from "@/lib/admin/control";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Control" };
export const dynamic = "force-dynamic";

const activityFormat = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function ControlPage() {
  const t = await getT();
  const { tableReady, queue, recentActivity } = await loadControlData();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">{t("Control Center")}</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">{t("Waiting on you")}</h1>
        </div>
        <span className="ops-pill" data-status="draft">
          {queue.length} {t("to review")}
        </span>
      </div>

      {!tableReady ? (
        <div className="ops-card mt-5 p-4 text-sm text-[var(--ops-muted)]">
          {t("The approval queue table isn’t in the database yet. Run the v3 migration in Neon and this fills in.")}{" "}
          <code className="ops-num">drizzle/0002_control_center.sql</code>
        </div>
      ) : null}

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="grid gap-3">
          <ControlQueue actions={queue} />
        </div>

        <div className="grid gap-4">
          <GuardrailNote
            lines={[
              t(GUARDRAILS.humanDecides),
              t(GUARDRAILS.nothingUntilApproved),
              t(GUARDRAILS.noPayment),
              t(GUARDRAILS.noTax),
            ]}
          />

          <section className="ops-card overflow-hidden">
            <div className="border-b border-[var(--ops-border)] px-4 py-3">
              <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Activity history")}</h2>
            </div>
            {recentActivity.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--ops-muted)]">{t("Nothing yet.")}</p>
            ) : (
              <ul className="divide-y divide-[var(--ops-border)]">
                {recentActivity.map((a) => (
                  <li key={a.id} className="px-4 py-2.5 text-sm">
                    <span className="ops-num text-xs text-[var(--ops-faint)]">
                      {activityFormat.format(a.createdAt)}
                    </span>
                    <p className="text-[var(--ops-text)]">
                      <strong>{a.actor}</strong> · {a.body || a.kind}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="ops-card p-4">
            <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("AI budget & stop")}</h2>
            <p className="mt-1 text-sm text-[var(--ops-muted)]">
              {t("A spend cap on the assistant and a global stop switch arrive with the outside connections (Phase 2). Until then nothing the assistant drafts can act on its own.")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

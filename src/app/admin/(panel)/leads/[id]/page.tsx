import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadActions } from "@/components/admin/LeadActions";
import { EditRecordForm } from "@/components/admin/EditRecordForm";
import { IntakeAssistant } from "@/components/admin/IntakeAssistant";
import { LogCallForm } from "@/components/admin/sales/LogCallForm";
import { SlaChip } from "@/components/admin/sales/SlaChip";
import { ActivityTimeline, LeadStatusPill, SourceBadge } from "@/components/admin/crm-bits";
import { ageLabel } from "@/lib/admin/crm";
import { getLead, listActivity } from "@/lib/admin/crm-data";
import { CALL_FLAG_LABELS, CALL_OUTCOME_LABELS, type CallFlag, type CallOutcome } from "@/lib/admin/sales";
import { loadLeadSales } from "@/lib/admin/sales-data";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Lead" };
export const dynamic = "force-dynamic";

const stamp = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" });

export default async function LeadDetailPage({ params }: PageProps<"/admin/leads/[id]">) {
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) notFound();

  const t = await getT();
  const now = new Date();
  const [activity, sales] = await Promise.all([listActivity("lead", lead.id), loadLeadSales(lead, now)]);

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/leads" className="text-sm font-medium text-[var(--ops-gold-ink)] hover:underline">
        ← {t("Pipeline")}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--ops-navy)]">{lead.name}</h1>
            <LeadStatusPill status={lead.status} />
            <SourceBadge source={lead.source} />
            <SlaChip clock={sales.clock} withStage />
          </div>
          <p className="mt-1 text-sm text-[var(--ops-muted)]">
            {[lead.phone, lead.email, lead.area].filter(Boolean).join(" · ") || t("No contact details")}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ops-faint)]">
            {ageLabel(lead.createdAt, now)} {t("old · created")} {stamp.format(lead.createdAt)} ·{" "}
            {lead.createdFrom === "website_form" ? t("from the website form") : t("added manually")}
          </p>
        </div>
        {lead.clientId ? (
          <Link href={`/admin/clients/${lead.clientId}`} className="ops-btn" data-variant="ghost">
            {t("View client")}
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]">
        <div className="grid gap-4">
          {lead.message ? (
            <section className="ops-card p-4">
              <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("What they said")}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--ops-text)]">
                {lead.message}
              </p>
            </section>
          ) : null}

          {lead.message ? (
            <IntakeAssistant leadId={lead.id} message={lead.message} leadName={lead.name} />
          ) : null}

          {lead.lostReason ? (
            <section className="ops-card p-4">
              <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Lost because")}</h2>
              <p className="mt-1 text-sm text-[var(--ops-text)]">{lead.lostReason}</p>
            </section>
          ) : null}

          <EditRecordForm
            kind="lead"
            id={lead.id}
            initial={{
              name: lead.name,
              phone: lead.phone,
              email: lead.email,
              area: lead.area,
              source: lead.source,
              message: lead.message,
            }}
          />

          <section className="ops-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Log a call")}</h2>
              <p className="text-xs text-[var(--ops-muted)]">
                {sales.state.callAttempts} {t("calls so far")}
                {sales.state.unansweredStreak > 0
                  ? ` · ${sales.state.unansweredStreak} ${t("unanswered in a row")}`
                  : ""}
              </p>
            </div>
            <div className="mt-3">
              <LogCallForm leadId={lead.id} />
            </div>
            {sales.calls.length > 0 ? (
              <ul className="mt-4 divide-y divide-[var(--ops-border)] border-t border-[var(--ops-border)]">
                {sales.calls.map((call) => (
                  <li key={call.id} className="py-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-[var(--ops-navy)]">
                        {t(CALL_OUTCOME_LABELS[call.outcome as CallOutcome] ?? call.outcome)}
                      </strong>
                      <span className="text-xs text-[var(--ops-faint)]">
                        {stamp.format(call.createdAt)} · {call.actor}
                      </span>
                      {call.flags.map((flag) => (
                        <span key={flag} className="ops-pill" data-status="draft">
                          {t(CALL_FLAG_LABELS[flag as CallFlag] ?? flag)}
                        </span>
                      ))}
                    </div>
                    {call.notes ? (
                      <p className="mt-0.5 whitespace-pre-wrap text-[var(--ops-text)]">{call.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="ops-card p-4">
            <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Timeline")}</h2>
            <ActivityTimeline rows={activity} />
          </section>
        </div>

        <aside className="ops-card h-fit p-4 lg:sticky lg:top-20">
          <LeadActions lead={lead} />
        </aside>
      </div>
    </div>
  );
}

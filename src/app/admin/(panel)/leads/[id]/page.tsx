import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadActions } from "@/components/admin/LeadActions";
import { IntakeAssistant } from "@/components/admin/IntakeAssistant";
import { ActivityTimeline, LeadStatusPill, SourceBadge } from "@/components/admin/crm-bits";
import { ageLabel } from "@/lib/admin/crm";
import { getLead, listActivity } from "@/lib/admin/crm-data";

export const metadata = { title: "Lead" };
export const dynamic = "force-dynamic";

const stamp = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" });

export default async function LeadDetailPage({ params }: PageProps<"/admin/leads/[id]">) {
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) notFound();

  const activity = await listActivity("lead", lead.id);
  const now = new Date();

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/leads" className="text-sm font-medium text-[var(--ops-gold-ink)] hover:underline">
        ← Pipeline
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--ops-navy)]">{lead.name}</h1>
            <LeadStatusPill status={lead.status} />
            <SourceBadge source={lead.source} />
          </div>
          <p className="mt-1 text-sm text-[var(--ops-muted)]">
            {[lead.phone, lead.email, lead.area].filter(Boolean).join(" · ") || "No contact details"}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ops-faint)]">
            {ageLabel(lead.createdAt, now)} old · created {stamp.format(lead.createdAt)} ·{" "}
            {lead.createdFrom === "website_form" ? "from the website form" : `added ${lead.createdFrom}`}
          </p>
        </div>
        {lead.clientId ? (
          <Link href={`/admin/clients/${lead.clientId}`} className="ops-btn" data-variant="ghost">
            View client
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]">
        <div className="grid gap-4">
          {lead.message ? (
            <section className="ops-card p-4">
              <h2 className="text-sm font-semibold text-[var(--ops-navy)]">What they said</h2>
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
              <h2 className="text-sm font-semibold text-[var(--ops-navy)]">Lost because</h2>
              <p className="mt-1 text-sm text-[var(--ops-text)]">{lead.lostReason}</p>
            </section>
          ) : null}

          <section className="ops-card p-4">
            <h2 className="text-sm font-semibold text-[var(--ops-navy)]">Timeline</h2>
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

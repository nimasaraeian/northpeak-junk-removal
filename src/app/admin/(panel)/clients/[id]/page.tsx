import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientActions } from "@/components/admin/ClientActions";
import { ClientJobsEditor } from "@/components/admin/ClientJobsEditor";
import { ActivityTimeline, LeadStatusPill, SourceBadge } from "@/components/admin/crm-bits";
import { StatusPill } from "@/components/admin/StatusPill";
import { site } from "@/content/site";
import { getClientDossier } from "@/lib/admin/crm-data";
import { formatCents, formatRange } from "@/lib/quote-engine";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Client" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" });

export default async function ClientDetailPage({ params }: PageProps<"/admin/clients/[id]">) {
  const { id } = await params;
  const dossier = await getClientDossier(Number(id));
  if (!dossier) notFound();

  const t = await getT();
  const { client, leads, quotes, jobs, activity } = dossier;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/clients" className="text-sm font-medium text-[var(--ops-gold-ink)] hover:underline">
        ← {t("All clients")}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--ops-navy)]">{client.name}</h1>
            <SourceBadge source={client.source} />
          </div>
          <p className="mt-1 text-sm text-[var(--ops-muted)]">
            {[client.phone, client.email, client.address || client.area].filter(Boolean).join(" · ") ||
              t("No contact details")}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ops-faint)]">
            {t("Client since")} {dateFormat.format(client.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="ops-label">{t("Lifetime value")}</p>
          <p className="ops-num text-2xl font-semibold text-[var(--ops-navy)]">
            {formatCents(dossier.lifetimeValueCents)}
          </p>
          <p className="text-xs text-[var(--ops-faint)]">{t("Midpoint of won quotes")}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]">
        <div className="grid gap-4">
          <section className="ops-card overflow-hidden">
            <h2 className="border-b border-[var(--ops-border)] px-4 py-3 text-sm font-semibold text-[var(--ops-navy)]">
              {t("Quotes")}
            </h2>
            {quotes.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--ops-muted)]">{t("No quotes yet.")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="ops-table">
                  <thead>
                    <tr><th>{t("Quote")}</th><th>{t("Range")}</th><th>{t("Status")}</th><th>{t("Date")}</th></tr>
                  </thead>
                  <tbody>
                    {quotes.map((quote) => (
                      <tr key={quote.id}>
                        <td>
                          <Link href={`/admin/quotes/${quote.id}`} className="font-medium text-[var(--ops-navy)] hover:underline">
                            #{quote.id}
                          </Link>
                        </td>
                        <td className="ops-num">{formatRange(quote.finalLowCents, quote.finalHighCents)}</td>
                        <td><StatusPill status={quote.status} /></td>
                        <td className="ops-num whitespace-nowrap text-[var(--ops-muted)]">
                          {dateFormat.format(quote.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="ops-card overflow-hidden">
            <h2 className="border-b border-[var(--ops-border)] px-4 py-3 text-sm font-semibold text-[var(--ops-navy)]">
              {t("Jobs")}
            </h2>
            <ClientJobsEditor jobs={jobs} />
          </section>

          {leads.length > 0 ? (
            <section className="ops-card overflow-hidden">
              <h2 className="border-b border-[var(--ops-border)] px-4 py-3 text-sm font-semibold text-[var(--ops-navy)]">
                {t("Leads")}
              </h2>
              <ul className="divide-y divide-[var(--ops-border)]">
                {leads.map((lead) => (
                  <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <Link href={`/admin/leads/${lead.id}`} className="font-medium text-[var(--ops-navy)] hover:underline">
                      {lead.name}
                    </Link>
                    <LeadStatusPill status={lead.status} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="ops-card p-4">
            <h2 className="text-sm font-semibold text-[var(--ops-navy)]">{t("Timeline")}</h2>
            <ActivityTimeline rows={activity} />
          </section>
        </div>

        <aside className="ops-card h-fit p-4 lg:sticky lg:top-20">
          <ClientActions client={client} reviewUrl={site.google.reviewUrl ?? null} />
        </aside>
      </div>
    </div>
  );
}

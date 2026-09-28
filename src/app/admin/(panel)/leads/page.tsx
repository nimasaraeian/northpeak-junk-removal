import Link from "next/link";
import { LeadBoard } from "@/components/admin/LeadBoard";
import { EmptyState } from "@/components/admin/crm-bits";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, PIPELINE_ORDER } from "@/lib/admin/crm";
import { listLeads } from "@/lib/admin/crm-data";
import { LEAD_OWNERS, LEAD_SOURCES, type LeadOwner, type LeadSource, type LeadStatus } from "@/lib/db/schema";

export const metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const params = await searchParams;
  const owner = (first(params.owner) ?? "all") as LeadOwner | "all";
  const source = (first(params.source) ?? "all") as LeadSource | "all";
  const status = (first(params.status) ?? "all") as LeadStatus | "all";
  const search = first(params.q) ?? "";

  const leads = await listLeads({ owner, source, status, search });
  // Rendered on the server so every card's "3d" agrees with the others and
  // does not shift between the server HTML and hydration.
  const now = new Date().toISOString();

  return (
    <div className="mx-auto max-w-[110rem]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">Pipeline</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </h1>
        </div>
        <Link href="/admin/leads/new" className="ops-btn" data-variant="primary">
          Add lead
        </Link>
      </div>

      <form className="ops-card mt-4 grid gap-3 p-3 sm:grid-cols-[1fr_auto_auto_auto_auto]">
        <label className="block">
          <span className="ops-label">Search</span>
          <input name="q" type="search" defaultValue={search} className="ops-input mt-1.5" placeholder="Name or phone" />
        </label>
        <label className="block">
          <span className="ops-label">Owner</span>
          <select name="owner" defaultValue={owner} className="ops-select mt-1.5">
            <option value="all">All</option>
            {LEAD_OWNERS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="ops-label">Source</span>
          <select name="source" defaultValue={source} className="ops-select mt-1.5">
            <option value="all">All</option>
            {LEAD_SOURCES.map((value) => (
              <option key={value} value={value}>{LEAD_SOURCE_LABELS[value]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="ops-label">Stage</span>
          <select name="status" defaultValue={status} className="ops-select mt-1.5">
            <option value="all">All</option>
            {PIPELINE_ORDER.map((value) => (
              <option key={value} value={value}>{LEAD_STATUS_LABELS[value]}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="ops-btn" data-variant="navy">Filter</button>
          <Link href="/admin/leads" className="ops-btn" data-variant="ghost">Clear</Link>
        </div>
      </form>

      <div className="mt-4">
        {leads.length === 0 ? (
          <div className="ops-card">
            <EmptyState
              title="No leads yet"
              body="Website enquiries land here automatically the moment the form posts. You can also add one by hand after a phone call."
              action={{ href: "/admin/leads/new", label: "Add the first lead" }}
            />
          </div>
        ) : (
          <LeadBoard leads={leads} now={now} />
        )}
      </div>
    </div>
  );
}

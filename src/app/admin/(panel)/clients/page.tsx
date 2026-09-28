import Link from "next/link";
import { EmptyState } from "@/components/admin/crm-bits";
import { clientRollups, listClients } from "@/lib/admin/crm-data";
import { formatCents } from "@/lib/quote-engine";

export const metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" });

export default async function ClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  const params = await searchParams;
  const search = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";

  const rows = await listClients(search);
  const rollups = await clientRollups(rows.map((row) => row.id));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">Clients</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">
            {rows.length} {rows.length === 1 ? "client" : "clients"}
          </h1>
        </div>
        <Link href="/admin/clients/new" className="ops-btn" data-variant="primary">
          Add client
        </Link>
      </div>

      <form className="ops-card mt-4 flex flex-wrap items-end gap-3 p-3">
        <label className="min-w-[12rem] flex-1">
          <span className="ops-label">Search</span>
          <input name="q" type="search" defaultValue={search} className="ops-input mt-1.5" placeholder="Name, phone or area" />
        </label>
        <button type="submit" className="ops-btn" data-variant="navy">Search</button>
        <Link href="/admin/clients" className="ops-btn" data-variant="ghost">Clear</Link>
      </form>

      <section className="ops-card mt-4 overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            title={search ? "Nothing matches that search" : "No clients yet"}
            body={
              search
                ? "Try a different name, phone number or area."
                : "A lead becomes a client from its own page, or add one by hand if they are already on the books."
            }
            action={search ? undefined : { href: "/admin/clients/new", label: "Add the first client" }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Area</th>
                  <th>Jobs</th>
                  <th>Lifetime value</th>
                  <th>Last activity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((client) => {
                  const rollup = rollups.get(client.id);
                  return (
                    <tr key={client.id}>
                      <td>
                        <Link href={`/admin/clients/${client.id}`} className="font-medium text-[var(--ops-navy)] hover:underline">
                          {client.name}
                        </Link>
                      </td>
                      <td className="ops-num text-[var(--ops-muted)]">{client.phone || "—"}</td>
                      <td className="text-[var(--ops-muted)]">{client.area || "—"}</td>
                      <td className="ops-num">{rollup?.jobCount ?? 0}</td>
                      <td className="ops-num font-medium">{formatCents(client.lifetimeValueCents)}</td>
                      <td className="ops-num whitespace-nowrap text-[var(--ops-muted)]">
                        {rollup?.lastActivityAt ? dateFormat.format(rollup.lastActivityAt) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

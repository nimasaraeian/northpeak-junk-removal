import { NewRecordForm } from "@/components/admin/NewRecordForm";

export const metadata = { title: "Add client" };
export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="ops-label">Clients</p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">Add a client</h1>
      <p className="mt-1 text-sm text-[var(--ops-muted)]">
        Someone already on the books. A lead becomes a client from its own page.
      </p>
      <div className="mt-5">
        <NewRecordForm kind="client" />
      </div>
    </div>
  );
}

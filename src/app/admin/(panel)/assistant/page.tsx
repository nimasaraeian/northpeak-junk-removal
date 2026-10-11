import { CommandConsole } from "@/components/admin/CommandConsole";

export const metadata = { title: "Assistant" };
export const dynamic = "force-dynamic";

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="ops-label">Office Manager</p>
        <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">Command the CRM</h1>
      </div>

      <p className="mt-3 text-sm text-[var(--ops-muted)]">
        Write what you want to change in your own words, in any language. The assistant proposes one
        specific change and nothing happens until you approve it. It can move a lead&rsquo;s status,
        set a follow-up date, add a note, and create or reschedule a job. It can&rsquo;t send
        messages to customers or delete anything.
      </p>

      <div className="mt-5">
        <CommandConsole />
      </div>
    </div>
  );
}

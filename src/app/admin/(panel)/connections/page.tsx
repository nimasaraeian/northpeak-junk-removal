import { anthropicApiKey } from "@/lib/admin/config";
import { isDatabaseConfigured } from "@/lib/db/client";
import { GuardrailNote } from "@/components/admin/GuardrailNote";
import { GUARDRAILS } from "@/lib/admin/control";

export const metadata = { title: "Connections" };
export const dynamic = "force-dynamic";

type ConnState = "connected" | "planned" | "off";

interface Connection {
  name: string;
  state: ConnState;
  note: string;
}

const STATE_LABEL: Record<ConnState, string> = {
  connected: "Connected",
  planned: "Not connected",
  off: "Off",
};

const STATE_TONE: Record<ConnState, "won" | "draft" | "lost"> = {
  connected: "won",
  planned: "draft",
  off: "lost",
};

export default function ConnectionsPage() {
  const aiOn = anthropicApiKey() !== undefined;
  const dbOn = isDatabaseConfigured();

  const connections: Connection[] = [
    {
      name: "JunkQ pricing engine",
      state: "connected",
      note: "Built in. Volume-based quoting lives in this panel.",
    },
    {
      name: "Database (Neon)",
      state: dbOn ? "connected" : "off",
      note: "All panel data — leads, quotes, jobs, the approval queue.",
    },
    {
      name: "Photo & intake assist (Anthropic)",
      state: aiOn ? "connected" : "planned",
      note: aiOn
        ? "Reads job photos and customer messages. Suggestions only."
        : "Set ANTHROPIC_API_KEY to turn on photo and intake assist.",
    },
    { name: "Workiz", state: "planned", note: "Field-service scheduling. Phase 2." },
    {
      name: "Google Workspace",
      state: "planned",
      note: "Gmail + Calendar for sending quotes and booking. Phase 2.",
    },
    { name: "Instagram", state: "planned", note: "Publishing marketing posts. Phase 2." },
    { name: "Google Ads", state: "planned", note: "Running campaigns. Phase 2." },
  ];

  const pending = connections.filter((c) => c.state !== "connected").length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ops-label">Connections</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-navy)]">What the panel is wired to</h1>
        </div>
        {pending > 0 ? (
          <span className="ops-pill" data-status="draft">
            {pending} not connected
          </span>
        ) : null}
      </div>

      <section className="ops-card mt-5 divide-y divide-[var(--ops-border)]">
        {connections.map((c) => (
          <div key={c.name} className="flex items-start justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold text-[var(--ops-navy)]">{c.name}</p>
              <p className="mt-0.5 text-xs text-[var(--ops-muted)]">{c.note}</p>
            </div>
            <span className="ops-pill shrink-0" data-status={STATE_TONE[c.state]}>
              {STATE_LABEL[c.state]}
            </span>
          </div>
        ))}
      </section>

      <div className="mt-4">
        <GuardrailNote
          lines={[
            "Nothing connects to an outside service without you turning it on.",
            GUARDRAILS.nothingUntilApproved,
          ]}
        />
      </div>
    </div>
  );
}

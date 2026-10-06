"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/provider";
import { logoutAction } from "@/lib/admin/actions";
import { ControlQueue } from "@/components/admin/ControlQueue";
import { formatCents, formatRange } from "@/lib/quote-engine";
import { PIPELINE_ORDER, LEAD_SOURCE_LABELS, isFollowUpOverdue } from "@/lib/admin/crm";
import type { CockpitData } from "@/lib/admin/cockpit-data";
import type { JobRow, LeadRow, LeadStatus } from "@/lib/db/schema";

type TabId =
  | "dashboard"
  | "control"
  | "customers"
  | "followups"
  | "quotes"
  | "jobs"
  | "reports"
  | "team"
  | "chat"
  | "settings";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
  won: "Won",
  lost: "Lost",
};

const JOB_STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

const OPERATORS = ["Nima", "Sina"] as const;

function Svg({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const NAV: { id: TabId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "M3 11l9-8 9 8M5 10v10h14V10" },
  { id: "control", label: "Control", icon: "M12 3a9 9 0 1 0 9 9M12 7v5l3 2" },
  { id: "customers", label: "Customers", icon: "M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
  { id: "followups", label: "Follow-ups", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  { id: "quotes", label: "Quotes", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" },
  { id: "jobs", label: "Jobs", icon: "M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 18.5a2.5 2.5 0 1 0 0 1" },
  { id: "reports", label: "Reports", icon: "M3 3v18h18M7 14l4-4 3 3 5-6" },
  { id: "team", label: "Team", icon: "M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 1 3-3.87M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
  { id: "chat", label: "Team Chat", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { id: "settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" },
];

const TITLE: Record<TabId, string> = {
  dashboard: "Dashboard",
  control: "Control Center",
  customers: "Customers",
  followups: "Follow-ups",
  quotes: "Quotes",
  jobs: "Jobs / Dispatch",
  reports: "Reports",
  team: "Team",
  chat: "Team Chat",
  settings: "Settings",
};

type T = (s: string) => string;

export function Cockpit({ operator, data }: { operator: string; data: CockpitData }) {
  const { t, lang, setLang } = useT();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pending = data.control.queue.length;
  const searchable = tab === "customers" || tab === "quotes" || tab === "followups" || tab === "jobs";

  return (
    <div className="cockpit">
      <div className="app">
        <aside className={`side${sidebarOpen ? " open" : ""}`}>
          <div className="brand">
            <span className="logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-nav.png" alt="NorthPeak" />
            </span>
            <span className="tag">{t("Ops")}</span>
          </div>
          <nav>
            {NAV.map((item) => (
              <button
                key={item.id}
                className={tab === item.id ? "on" : ""}
                onClick={() => {
                  setTab(item.id);
                  setSidebarOpen(false);
                  setQuery("");
                }}
              >
                <Svg d={item.icon} />
                <span>{t(item.label)}</span>
                {item.id === "control" && pending > 0 ? <span className="badge">{pending}</span> : null}
              </button>
            ))}
          </nav>
          <div className="me">
            <span className="av">{operator.slice(0, 2).toUpperCase()}</span>
            <div style={{ minWidth: 0 }}>
              <b>{operator}</b>
              <span>{t("Internal · v1")}</span>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="out">
                {t("Log out")}
              </button>
            </form>
          </div>
        </aside>

        <main className="main">
          <div className="top">
            <button className="btn sm burger" onClick={() => setSidebarOpen((v) => !v)} aria-label="menu">
              ☰
            </button>
            <h2>{t(TITLE[tab])}</h2>
            <div className="sp">
              {searchable ? (
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Search name, phone, area…")}
                  style={{ height: 38, minWidth: 220 }}
                />
              ) : null}
              <div className="lang" role="group" aria-label="Language">
                <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
                  EN
                </button>
                <button className={lang === "fa" ? "on" : ""} onClick={() => setLang("fa")}>
                  فا
                </button>
              </div>
              <Link href="/admin/leads/new" className="btn">
                {t("+ Lead")}
              </Link>
              <Link href="/admin/quotes/new" className="btn p">
                {t("New quote")}
              </Link>
            </div>
          </div>

          {tab === "dashboard" && <DashboardTab data={data} t={t} go={setTab} />}
          {tab === "control" && <ControlTab data={data} t={t} />}
          {tab === "customers" && <CustomersTab data={data} t={t} query={query} />}
          {tab === "followups" && <FollowupsTab data={data} t={t} query={query} />}
          {tab === "quotes" && <QuotesTab data={data} t={t} query={query} />}
          {tab === "jobs" && <JobsTab data={data} t={t} query={query} />}
          {tab === "reports" && <ReportsTab data={data} t={t} />}
          {tab === "team" && <TeamTab data={data} t={t} />}
          {tab === "settings" && <SettingsTab data={data} t={t} />}
          {tab === "chat" && <ChatStub t={t} />}
        </main>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card kpi">
      <div className="l">{label}</div>
      <div className="v">{value}</div>
      {hint ? <div className="t warn">{hint}</div> : null}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return <span className="av">{(name || "?").slice(0, 2).toUpperCase()}</span>;
}

const dateFmt = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" });

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function go(href: string) {
  window.location.href = href;
}

// ---------------------------------------------------------------- Dashboard

function DashboardTab({ data, t, go: setTab }: { data: CockpitData; t: T; go: (id: TabId) => void }) {
  const { stats, crm } = data;
  const funnel = PIPELINE_ORDER.filter((s) => s !== "won" && s !== "lost");
  const max = Math.max(1, ...funnel.map((s) => crm.leadsByStage[s]));

  return (
    <div className="grid">
      <div className="grid k4">
        <Kpi label={t("Quotes this month")} value={String(stats.quotesThisMonth)} />
        <Kpi label={t("Win rate")} value={stats.winRatePct === null ? "—" : `${Math.round(stats.winRatePct)}%`} />
        <Kpi label={t("Revenue won")} value={formatCents(stats.revenueWonCents)} />
        <Kpi label={t("Open leads")} value={String(crm.openLeads)} />
      </div>

      <div className="grid k2">
        <div className="card pad">
          <div className="sec-t">
            {t("Pipeline")}
            <span className="sp">
              <button className="btn sm" onClick={() => setTab("customers")}>
                {t("Open")}
              </button>
            </span>
          </div>
          <div className="grid" style={{ gap: 10 }}>
            {funnel.map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 90, fontSize: 12, color: "var(--muted)" }}>{t(STATUS_LABEL[s])}</span>
                <span style={{ flex: 1, background: "#EDF1F7", borderRadius: 6, height: 18 }}>
                  <span style={{ display: "block", height: "100%", borderRadius: 6, background: "var(--orange)", width: `${(crm.leadsByStage[s] / max) * 100}%` }} />
                </span>
                <span className="num" style={{ width: 26, textAlign: "end" }}>{crm.leadsByStage[s]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid k2" style={{ alignContent: "start" }}>
          <div className="card kpi" style={{ cursor: "pointer" }} onClick={() => setTab("jobs")}>
            <div className="l">{t("Jobs today")}</div>
            <div className="v">{crm.jobsToday}</div>
          </div>
          <div className="card kpi" style={{ cursor: "pointer" }} onClick={() => setTab("followups")}>
            <div className="l">{t("Overdue follow-ups")}</div>
            <div className="v">{crm.overdueFollowUps}</div>
          </div>
          <div className="card kpi" style={{ cursor: "pointer" }} onClick={() => setTab("control")}>
            <div className="l">{t("Awaiting approval")}</div>
            <div className="v">{data.control.queue.length}</div>
          </div>
          <div className="card kpi">
            <div className="l">{t("Clients")}</div>
            <div className="v">{data.clients.length}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="sec-t" style={{ padding: "16px 18px 0" }}>{t("Latest quotes")}</div>
        {data.quotes.length === 0 ? (
          <div className="empty">{t("Nothing yet.")}</div>
        ) : (
          <table>
            <thead>
              <tr><th>{t("Customer")}</th><th>{t("Area")}</th><th>{t("Range")}</th><th>{t("Status")}</th><th>{t("Date")}</th></tr>
            </thead>
            <tbody>
              {data.quotes.slice(0, 10).map((q) => (
                <tr key={q.id} className="click" onClick={() => go(`/admin/quotes/${q.id}`)}>
                  <td><b>{q.customerName || `#${q.id}`}</b></td>
                  <td style={{ color: "var(--muted)" }}>{q.customerArea || "—"}</td>
                  <td className="num">{formatRange(q.finalLowCents, q.finalHighCents)}</td>
                  <td><span className="chip">{t(cap(q.status))}</span></td>
                  <td className="num" style={{ color: "var(--muted)" }}>{dateFmt.format(q.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Control

function ControlTab({ data, t }: { data: CockpitData; t: T }) {
  return (
    <div className="grid">
      {!data.control.tableReady ? (
        <div className="card pad" style={{ color: "var(--muted)" }}>{t("The approval queue table isn’t ready yet.")}</div>
      ) : null}
      <ControlQueue actions={data.control.queue} />
    </div>
  );
}

// ---------------------------------------------------------------- Customers

function matchText(q: string, ...fields: (string | null | undefined)[]): boolean {
  if (!q.trim()) return true;
  const n = q.trim().toLowerCase();
  return fields.some((f) => (f ?? "").toLowerCase().includes(n));
}

function CustomersTab({ data, t, query }: { data: CockpitData; t: T; query: string }) {
  const [sub, setSub] = useState<"leads" | "clients">("leads");
  const leads = data.leads.filter((l) => matchText(query, l.name, l.phone, l.area, l.email));
  const clients = data.clients.filter((c) => matchText(query, c.name, c.phone, c.area, c.email));

  return (
    <div className="grid">
      <div className="tabs">
        <button className={sub === "leads" ? "on" : ""} onClick={() => setSub("leads")}>{t("Leads")} ({leads.length})</button>
        <button className={sub === "clients" ? "on" : ""} onClick={() => setSub("clients")}>{t("Clients")} ({clients.length})</button>
      </div>
      <div className="card">
        {sub === "leads" ? (
          leads.length === 0 ? <div className="empty">{t("Nothing yet.")}</div> : (
            <table>
              <thead><tr><th>{t("Name")}</th><th>{t("Phone")}</th><th>{t("Area")}</th><th>{t("Status")}</th><th>{t("Owner")}</th></tr></thead>
              <tbody>
                {leads.slice(0, 80).map((l) => (
                  <tr key={l.id} className="click" onClick={() => go(`/admin/leads/${l.id}`)}>
                    <td><div className="who"><Avatar name={l.name} /><b>{l.name}</b></div></td>
                    <td className="num" style={{ color: "var(--muted)" }}>{l.phone || "—"}</td>
                    <td style={{ color: "var(--muted)" }}>{l.area || "—"}</td>
                    <td><span className="chip">{t(STATUS_LABEL[l.status])}</span></td>
                    <td style={{ color: "var(--muted)" }}>{l.owner === "unassigned" ? "—" : l.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : clients.length === 0 ? <div className="empty">{t("Nothing yet.")}</div> : (
          <table>
            <thead><tr><th>{t("Name")}</th><th>{t("Phone")}</th><th>{t("Area")}</th><th>{t("Revenue won")}</th></tr></thead>
            <tbody>
              {clients.slice(0, 80).map((c) => (
                <tr key={c.id} className="click" onClick={() => go(`/admin/clients/${c.id}`)}>
                  <td><div className="who"><Avatar name={c.name} /><b>{c.name}</b></div></td>
                  <td className="num" style={{ color: "var(--muted)" }}>{c.phone || "—"}</td>
                  <td style={{ color: "var(--muted)" }}>{c.area || "—"}</td>
                  <td className="num">{formatCents(c.lifetimeValueCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------- Follow-ups

function FollowupsTab({ data, t, query }: { data: CockpitData; t: T; query: string }) {
  const now = new Date();
  const due = useMemo(() => {
    return data.leads
      .filter((l) => l.nextFollowUpAt && l.status !== "won" && l.status !== "lost")
      .filter((l) => matchText(query, l.name, l.phone, l.area))
      .sort((a, b) => (a.nextFollowUpAt!.getTime() - b.nextFollowUpAt!.getTime()));
  }, [data.leads, query]);

  function chip(l: LeadRow) {
    const d = l.nextFollowUpAt!;
    if (isFollowUpOverdue(d, now)) return <span className="tag" style={{ background: "rgba(229,72,77,.1)", color: "var(--red)" }}>{t("Overdue")} · {dateFmt.format(d)}</span>;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isToday = d >= today && d.getTime() < today.getTime() + 24 * 3600 * 1000;
    if (isToday) return <span className="tag" style={{ background: "rgba(217,145,0,.14)", color: "#8A5B00" }}>{t("Today")}</span>;
    return <span className="tag" style={{ background: "#EEF2F7", color: "var(--body)" }}>{dateFmt.format(d)}</span>;
  }

  return (
    <div className="card">
      {due.length === 0 ? (
        <div className="empty">{t("No follow-ups due — everyone is up to date.")}</div>
      ) : (
        <table>
          <thead><tr><th>{t("Name")}</th><th>{t("When")}</th><th>{t("Phone")}</th><th>{t("Status")}</th><th>{t("Owner")}</th></tr></thead>
          <tbody>
            {due.map((l) => (
              <tr key={l.id} className="click" onClick={() => go(`/admin/leads/${l.id}`)}>
                <td><div className="who"><Avatar name={l.name} /><b>{l.name}</b></div></td>
                <td>{chip(l)}</td>
                <td className="num" style={{ color: "var(--muted)" }}>{l.phone || "—"}</td>
                <td><span className="chip">{t(STATUS_LABEL[l.status])}</span></td>
                <td style={{ color: "var(--muted)" }}>{l.owner === "unassigned" ? "—" : l.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ------------------------------------------------------------------- Quotes

function QuotesTab({ data, t, query }: { data: CockpitData; t: T; query: string }) {
  const rows = data.quotes.filter((q) => matchText(query, q.customerName, q.customerPhone, q.customerArea));
  return (
    <div className="card">
      {rows.length === 0 ? <div className="empty">{t("Nothing yet.")}</div> : (
        <table>
          <thead><tr><th>{t("Customer")}</th><th>{t("Area")}</th><th>{t("Range")}</th><th>{t("Status")}</th><th>{t("By")}</th><th>{t("Date")}</th></tr></thead>
          <tbody>
            {rows.map((q) => (
              <tr key={q.id} className="click" onClick={() => go(`/admin/quotes/${q.id}`)}>
                <td><b>{q.customerName || `#${q.id}`}</b></td>
                <td style={{ color: "var(--muted)" }}>{q.customerArea || "—"}</td>
                <td className="num">{formatRange(q.finalLowCents, q.finalHighCents)}</td>
                <td><span className="chip">{t(cap(q.status))}</span></td>
                <td style={{ color: "var(--muted)" }}>{q.createdBy}</td>
                <td className="num" style={{ color: "var(--muted)" }}>{dateFmt.format(q.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// --------------------------------------------------------------------- Jobs

function JobsTab({ data, t, query }: { data: CockpitData; t: T; query: string }) {
  const clientName = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of data.clients) m.set(c.id, c.name);
    return m;
  }, [data.clients]);

  const rows = data.jobs.filter((j) => matchText(query, j.clientId ? clientName.get(j.clientId) : "", j.address));

  function when(j: JobRow): string {
    return j.scheduledStart ? dateFmt.format(j.scheduledStart) : t("Unscheduled");
  }

  return (
    <div className="card">
      {rows.length === 0 ? <div className="empty">{t("No jobs in this window.")}</div> : (
        <table>
          <thead><tr><th>{t("Customer")}</th><th>{t("When")}</th><th>{t("Status")}</th><th>{t("Crew")}</th><th>{t("Address")}</th></tr></thead>
          <tbody>
            {rows.map((j) => (
              <tr key={j.id} className="click" onClick={() => go("/admin/calendar")}>
                <td><b>{j.clientId ? clientName.get(j.clientId) ?? "—" : "—"}</b></td>
                <td className="num" style={{ color: j.scheduledStart ? "inherit" : "var(--muted)" }}>{when(j)}</td>
                <td><span className="chip">{t(JOB_STATUS_LABEL[j.status] ?? j.status)}</span></td>
                <td style={{ color: "var(--muted)" }}>{j.assignedTo === "unassigned" ? "—" : j.assignedTo}</td>
                <td style={{ color: "var(--muted)" }}>{j.address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Reports

function ReportsTab({ data, t }: { data: CockpitData; t: T }) {
  const total = data.leads.length;
  const won = data.leads.filter((l) => l.status === "won").length;
  const lost = data.leads.filter((l) => l.status === "lost").length;
  const decided = won + lost;
  const conv = decided === 0 ? null : Math.round((won / decided) * 100);

  const bySource = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of data.leads) m.set(l.source, (m.get(l.source) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [data.leads]);
  const srcMax = Math.max(1, ...bySource.map(([, n]) => n));

  return (
    <div className="grid">
      <div className="grid k4">
        <Kpi label={t("Total leads")} value={String(total)} />
        <Kpi label={t("Won leads")} value={String(won)} />
        <Kpi label={t("Conversion")} value={conv === null ? "—" : `${conv}%`} />
        <Kpi label={t("Revenue won")} value={formatCents(data.stats.revenueWonCents)} />
      </div>

      <div className="grid k2">
        <div className="card pad">
          <div className="sec-t">{t("By source")}</div>
          <div className="grid" style={{ gap: 10 }}>
            {bySource.map(([src, n]) => (
              <div key={src} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 90, fontSize: 12, color: "var(--muted)" }}>{t(LEAD_SOURCE_LABELS[src as keyof typeof LEAD_SOURCE_LABELS] ?? src)}</span>
                <span style={{ flex: 1, background: "#EDF1F7", borderRadius: 6, height: 18 }}>
                  <span style={{ display: "block", height: "100%", borderRadius: 6, background: "var(--navy)", width: `${(n / srcMax) * 100}%` }} />
                </span>
                <span className="num" style={{ width: 26, textAlign: "end" }}>{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card pad">
          <div className="sec-t">{t("By status")}</div>
          <div className="grid" style={{ gap: 10 }}>
            {PIPELINE_ORDER.map((s) => {
              const n = data.leads.filter((l) => l.status === s).length;
              const m = Math.max(1, total);
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 90, fontSize: 12, color: "var(--muted)" }}>{t(STATUS_LABEL[s])}</span>
                  <span style={{ flex: 1, background: "#EDF1F7", borderRadius: 6, height: 18 }}>
                    <span style={{ display: "block", height: "100%", borderRadius: 6, background: "var(--orange)", width: `${(n / m) * 100}%` }} />
                  </span>
                  <span className="num" style={{ width: 26, textAlign: "end" }}>{n}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------- Team

function TeamTab({ data, t }: { data: CockpitData; t: T }) {
  const perOp = OPERATORS.map((op) => {
    const mine = data.quotes.filter((q) => q.createdBy === op);
    const wonQ = mine.filter((q) => q.status === "won");
    const revenue = wonQ.reduce((s, q) => s + Math.round((q.finalLowCents + q.finalHighCents) / 2), 0);
    return { op, created: mine.length, won: wonQ.length, revenue };
  });

  return (
    <div className="grid k2">
      {perOp.map(({ op, created, won, revenue }) => (
        <div key={op} className="card pad">
          <div className="who" style={{ marginBottom: 14 }}>
            <Avatar name={op} />
            <b style={{ fontSize: 15 }}>{op}</b>
          </div>
          <div className="grid k3">
            <div><div className="l" style={{ color: "var(--muted)", fontSize: 12 }}>{t("Created")}</div><div className="num" style={{ fontSize: 20, fontWeight: 800 }}>{created}</div></div>
            <div><div className="l" style={{ color: "var(--muted)", fontSize: 12 }}>{t("Won")}</div><div className="num" style={{ fontSize: 20, fontWeight: 800 }}>{won}</div></div>
            <div><div className="l" style={{ color: "var(--muted)", fontSize: 12 }}>{t("Revenue")}</div><div className="num" style={{ fontSize: 20, fontWeight: 800 }}>{formatCents(revenue)}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------- Settings

function SettingsTab({ data, t }: { data: CockpitData; t: T }) {
  const p = data.pricing;
  const rows: [string, string][] = [
    [t("Truck capacity"), `${p.truckCapacityFt3} ft³`],
    [t("Rate / yd³"), formatCents(p.ratePerYd3Cents)],
    [t("Minimum job"), formatCents(p.minJobCents)],
    [t("Packing"), `${p.packingPct}%`],
  ];
  return (
    <div className="grid">
      <div className="card pad">
        <div className="sec-t">
          {t("Pricing")}
          <span className="sp">
            <Link href="/admin/settings" className="btn sm">{t("Open settings to edit")}</Link>
          </span>
        </div>
        <table>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}><td style={{ color: "var(--muted)" }}>{k}</td><td className="num" style={{ textAlign: "end" }}>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------- Chat

function ChatStub({ t }: { t: T }) {
  return (
    <div className="card">
      <div className="empty">{t("Team chat is coming next — it needs its own store, which is the following step.")}</div>
    </div>
  );
}

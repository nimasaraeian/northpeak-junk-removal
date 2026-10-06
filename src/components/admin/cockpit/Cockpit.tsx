"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useT } from "@/lib/i18n/provider";
import { logoutAction } from "@/lib/admin/actions";
import { ControlQueue } from "@/components/admin/ControlQueue";
import { formatCents, formatRange } from "@/lib/quote-engine";
import { PIPELINE_ORDER } from "@/lib/admin/crm";
import type { CockpitData } from "@/lib/admin/cockpit-data";
import type { LeadStatus } from "@/lib/db/schema";

type TabId =
  | "dashboard"
  | "customers"
  | "followups"
  | "quotes"
  | "jobs"
  | "control"
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

const PERSIAN_TITLE: Record<TabId, string> = {
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

export function Cockpit({ operator, data }: { operator: string; data: CockpitData }) {
  const { t, lang, setLang } = useT();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pending = data.control.queue.length;

  return (
    <div className="cockpit">
      <div className="app">
        <aside className={`side${sidebarOpen ? " open" : ""}`}>
          <div className="brand">
            <b>
              NorthPeak <i>Ops</i>
            </b>
            <span>{t("Internal · v1")}</span>
          </div>
          <nav>
            {NAV.map((item) => (
              <button
                key={item.id}
                className={tab === item.id ? "on" : ""}
                onClick={() => {
                  setTab(item.id);
                  setSidebarOpen(false);
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
            <h2>{t(PERSIAN_TITLE[tab])}</h2>
            <div className="sp">
              <div className="lang" role="group" aria-label="Language">
                <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
                  EN
                </button>
                <button className={lang === "fa" ? "on" : ""} onClick={() => setLang("fa")}>
                  فا
                </button>
              </div>
              <Link href="/admin/quotes/new" className="btn p">
                {t("New quote")}
              </Link>
            </div>
          </div>

          {tab === "dashboard" && <DashboardTab data={data} t={t} />}
          {tab === "control" && <ControlTab data={data} t={t} />}
          {tab === "customers" && <CustomersTab data={data} t={t} />}
          {tab === "quotes" && <QuotesTab data={data} t={t} />}
          {tab === "followups" && <Stub t={t} href="/admin/leads" />}
          {tab === "jobs" && <Stub t={t} href="/admin/calendar" />}
          {tab === "reports" && <Stub t={t} />}
          {tab === "team" && <Stub t={t} />}
          {tab === "chat" && <Stub t={t} />}
          {tab === "settings" && <Stub t={t} href="/admin/settings" />}
        </main>
      </div>
    </div>
  );
}

type T = (s: string) => string;

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card kpi">
      <div className="l">{label}</div>
      <div className="v">{value}</div>
      {hint ? <div className="t warn">{hint}</div> : null}
    </div>
  );
}

function DashboardTab({ data, t }: { data: CockpitData; t: T }) {
  const { stats, crm } = data;
  const funnel = PIPELINE_ORDER.filter((s) => s !== "won" && s !== "lost");
  const max = Math.max(1, ...funnel.map((s) => crm.leadsByStage[s]));
  const dateFmt = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" });

  return (
    <div className="grid">
      <div className="grid k4">
        <Kpi label={t("Quotes this month")} value={String(stats.quotesThisMonth)} />
        <Kpi
          label={t("Win rate")}
          value={stats.winRatePct === null ? "—" : `${Math.round(stats.winRatePct)}%`}
        />
        <Kpi label={t("Revenue won")} value={formatCents(stats.revenueWonCents)} />
        <Kpi label={t("Open leads")} value={String(crm.openLeads)} />
      </div>

      <div className="grid k2">
        <div className="card pad">
          <div className="sec-t">{t("Pipeline")}</div>
          <div className="grid" style={{ gap: 10 }}>
            {funnel.map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 80, fontSize: 12, color: "var(--muted)" }}>{t(STATUS_LABEL[s])}</span>
                <span style={{ flex: 1, background: "#EDF1F7", borderRadius: 6, height: 18 }}>
                  <span
                    style={{
                      display: "block",
                      height: "100%",
                      borderRadius: 6,
                      background: "var(--orange)",
                      width: `${(crm.leadsByStage[s] / max) * 100}%`,
                    }}
                  />
                </span>
                <span className="num" style={{ width: 26, textAlign: "end" }}>
                  {crm.leadsByStage[s]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card pad">
          <div className="sec-t">
            {t("Jobs today")} · {t("Overdue follow-ups")}
          </div>
          <div className="grid k2">
            <Kpi label={t("Jobs today")} value={String(crm.jobsToday)} />
            <Kpi label={t("Overdue follow-ups")} value={String(crm.overdueFollowUps)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="sec-t" style={{ padding: "16px 18px 0" }}>
          {t("Latest quotes")}
        </div>
        {data.quotes.length === 0 ? (
          <div className="empty">{t("No quotes yet. Start with")} …</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t("Customer")}</th>
                <th>{t("Area")}</th>
                <th>{t("Range")}</th>
                <th>{t("Status")}</th>
                <th>{t("Date")}</th>
              </tr>
            </thead>
            <tbody>
              {data.quotes.slice(0, 12).map((q) => (
                <tr key={q.id}>
                  <td>
                    <b>{q.customerName || `#${q.id}`}</b>
                    {q.customerPhone ? <span className="num" style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>{q.customerPhone}</span> : null}
                  </td>
                  <td style={{ color: "var(--muted)" }}>{q.customerArea || "—"}</td>
                  <td className="num">{formatRange(q.finalLowCents, q.finalHighCents)}</td>
                  <td>
                    <span className="chip">{t(cap(q.status))}</span>
                  </td>
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

function ControlTab({ data, t }: { data: CockpitData; t: T }) {
  return (
    <div className="grid">
      {!data.control.tableReady ? (
        <div className="card pad" style={{ color: "var(--muted)" }}>
          {t("The approval queue table isn’t ready yet.")}
        </div>
      ) : null}
      <ControlQueue actions={data.control.queue} />
    </div>
  );
}

function CustomersTab({ data, t }: { data: CockpitData; t: T }) {
  const [sub, setSub] = useState<"leads" | "clients">("leads");
  return (
    <div className="grid">
      <div className="tabs">
        <button className={sub === "leads" ? "on" : ""} onClick={() => setSub("leads")}>
          {t("Leads")} ({data.leads.length})
        </button>
        <button className={sub === "clients" ? "on" : ""} onClick={() => setSub("clients")}>
          {t("Clients")} ({data.clients.length})
        </button>
      </div>

      <div className="card">
        {sub === "leads" ? (
          data.leads.length === 0 ? (
            <div className="empty">{t("Nothing yet.")}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t("Name")}</th>
                  <th>{t("Phone")}</th>
                  <th>{t("Area")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Owner")}</th>
                </tr>
              </thead>
              <tbody>
                {data.leads.slice(0, 50).map((l) => (
                  <tr key={l.id} className="click" onClick={() => (window.location.href = `/admin/leads/${l.id}`)}>
                    <td>
                      <b>{l.name}</b>
                    </td>
                    <td className="num" style={{ color: "var(--muted)" }}>{l.phone || "—"}</td>
                    <td style={{ color: "var(--muted)" }}>{l.area || "—"}</td>
                    <td>
                      <span className="chip">{t(STATUS_LABEL[l.status])}</span>
                    </td>
                    <td style={{ color: "var(--muted)" }}>{l.owner === "unassigned" ? "—" : l.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : data.clients.length === 0 ? (
          <div className="empty">{t("Nothing yet.")}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t("Name")}</th>
                <th>{t("Phone")}</th>
                <th>{t("Area")}</th>
                <th>{t("Revenue won")}</th>
              </tr>
            </thead>
            <tbody>
              {data.clients.slice(0, 50).map((c) => (
                <tr key={c.id} className="click" onClick={() => (window.location.href = `/admin/clients/${c.id}`)}>
                  <td>
                    <b>{c.name}</b>
                  </td>
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

function QuotesTab({ data, t }: { data: CockpitData; t: T }) {
  const dateFmt = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" });
  return (
    <div className="card">
      {data.quotes.length === 0 ? (
        <div className="empty">{t("Nothing yet.")}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t("Customer")}</th>
              <th>{t("Area")}</th>
              <th>{t("Range")}</th>
              <th>{t("Status")}</th>
              <th>{t("By")}</th>
              <th>{t("Date")}</th>
            </tr>
          </thead>
          <tbody>
            {data.quotes.map((q) => (
              <tr key={q.id} className="click" onClick={() => (window.location.href = `/admin/quotes/${q.id}`)}>
                <td>
                  <b>{q.customerName || `#${q.id}`}</b>
                </td>
                <td style={{ color: "var(--muted)" }}>{q.customerArea || "—"}</td>
                <td className="num">{formatRange(q.finalLowCents, q.finalHighCents)}</td>
                <td>
                  <span className="chip">{t(cap(q.status))}</span>
                </td>
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

function Stub({ t, href }: { t: T; href?: Route }) {
  return (
    <div className="card">
      <div className="empty">
        <div style={{ marginBottom: href ? 14 : 0 }}>{t("This section is being built.")}</div>
        {href ? (
          <Link href={href} className="btn">
            {t("Open the full page")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

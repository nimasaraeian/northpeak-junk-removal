import { loadDashboardStats, listQuotes, loadPricingSettings, type DashboardStats } from "@/lib/admin/data";
import {
  loadCrmDashboardStats,
  listLeads,
  listClients,
  listJobsBetween,
  listUnscheduledJobs,
  type CrmDashboardStats,
} from "@/lib/admin/crm-data";
import { loadControlData, type ControlData } from "@/lib/admin/control-data";
import { isSmsConfigured } from "@/lib/admin/config";
import type { PricingSettings } from "@/lib/quote-engine";
import type { ClientRow, JobRow, LeadRow, QuoteRow } from "@/lib/db/schema";

/**
 * One aggregate read for the whole cockpit, so tab switches are instant: the
 * server loads everything once, the client holds it and swaps tabs in place —
 * the New Cap feel, where nothing reloads the page.
 */
export interface CockpitData {
  stats: DashboardStats;
  crm: CrmDashboardStats;
  quotes: QuoteRow[];
  leads: LeadRow[];
  clients: ClientRow[];
  jobs: JobRow[];
  pricing: PricingSettings;
  control: ControlData;
  /** Whether Twilio is configured, so the Send SMS box can show or hide. */
  smsEnabled: boolean;
}

const DAY = 24 * 60 * 60 * 1000;

export async function loadCockpitData(): Promise<CockpitData> {
  const now = new Date();
  const from = new Date(now.getTime() - 30 * DAY);
  const to = new Date(now.getTime() + 90 * DAY);

  const [stats, crm, quotes, leads, clients, scheduled, unscheduled, pricing, control] =
    await Promise.all([
      loadDashboardStats(),
      loadCrmDashboardStats(),
      listQuotes({}, 150),
      listLeads({}, 400),
      listClients("", 400),
      listJobsBetween(from, to),
      listUnscheduledJobs(100),
      loadPricingSettings(),
      loadControlData(),
    ]);

  // Scheduled jobs first (by date), then unscheduled in a backlog.
  const jobs = [...scheduled, ...unscheduled];

  return { stats, crm, quotes, leads, clients, jobs, pricing, control, smsEnabled: isSmsConfigured() };
}

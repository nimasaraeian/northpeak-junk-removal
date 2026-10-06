import { loadDashboardStats, listQuotes, type DashboardStats } from "@/lib/admin/data";
import { loadCrmDashboardStats, listLeads, listClients, type CrmDashboardStats } from "@/lib/admin/crm-data";
import { loadControlData, type ControlData } from "@/lib/admin/control-data";
import type { ClientRow, LeadRow, QuoteRow } from "@/lib/db/schema";

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
  control: ControlData;
}

export async function loadCockpitData(): Promise<CockpitData> {
  const [stats, crm, quotes, leads, clients, control] = await Promise.all([
    loadDashboardStats(),
    loadCrmDashboardStats(),
    listQuotes({}, 100),
    listLeads({}, 300),
    listClients("", 300),
    loadControlData(),
  ]);
  return { stats, crm, quotes, leads, clients, control };
}

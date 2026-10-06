import "./cockpit.css";
import { requireOperator } from "@/lib/admin/auth";
import { isAdminConfigured } from "@/lib/admin/config";
import { SetupScreen } from "@/components/admin/SetupScreen";
import { Cockpit } from "@/components/admin/cockpit/Cockpit";
import { loadCockpitData } from "@/lib/admin/cockpit-data";

export const metadata = { title: "Cockpit" };
export const dynamic = "force-dynamic";

export default async function CockpitPage() {
  if (!isAdminConfigured()) return <SetupScreen />;
  const operator = await requireOperator();
  const data = await loadCockpitData();
  return <Cockpit operator={operator} data={data} />;
}

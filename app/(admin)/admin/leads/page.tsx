import { redirect } from "next/navigation";
import { getAllLeads } from "@/lib/db-admin";
import { LeadsPageClient } from "@/components/admin/LeadsPageClient";

export default async function AdminLeadsPage() {
  let leads;
  try {
    leads = await getAllLeads();
  } catch {
    redirect("/login");
  }

  return <LeadsPageClient initialLeads={leads} />;
}

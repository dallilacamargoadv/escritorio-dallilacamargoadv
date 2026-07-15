import { redirect } from "next/navigation";
import { getAllLeads } from "@/lib/db-admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminLeadsPage() {
  let leads;
  try {
    leads = await getAllLeads();
  } catch {
    redirect("/login");
  }

  return <AdminDashboard initialLeads={leads} />;
}

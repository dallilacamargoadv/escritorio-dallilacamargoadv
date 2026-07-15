import { redirect } from "next/navigation";
import { getLeadById } from "@/lib/db-admin";
import { ClienteForm } from "@/components/admin/ClienteForm";

export default async function NewClientePage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const { leadId } = await searchParams;

  let leadPrefill;
  try {
    leadPrefill = leadId ? (await getLeadById(leadId)) ?? undefined : undefined;
  } catch {
    redirect("/login");
  }

  return <ClienteForm leadPrefill={leadPrefill} />;
}

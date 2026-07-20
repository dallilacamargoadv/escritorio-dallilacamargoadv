import { redirect } from "next/navigation";
import { getAllFluxoTemplates } from "@/lib/db-fluxo-templates";
import { FluxosAdminList } from "@/components/admin/FluxosAdminList";

export default async function AdminFluxosPage() {
  let templates;
  try {
    templates = await getAllFluxoTemplates();
  } catch {
    redirect("/login");
  }

  return <FluxosAdminList initialTemplates={templates ?? []} />;
}

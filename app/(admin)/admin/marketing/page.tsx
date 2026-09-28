import { redirect } from "next/navigation";
import { getAllLeads } from "@/lib/db-admin";
import { getConteudoEditorialRecente } from "@/lib/db-conteudo-editorial";
import { MarketingOverviewClient } from "@/components/admin/MarketingOverviewClient";

export default async function MarketingPage() {
  let leads;
  let conteudos;
  try {
    [leads, conteudos] = await Promise.all([
      getAllLeads(),
      getConteudoEditorialRecente(180),
    ]);
  } catch {
    redirect("/login");
  }

  return <MarketingOverviewClient leads={leads} conteudos={conteudos} />;
}

import { notFound, redirect } from "next/navigation";
import { getParceiroById } from "@/lib/db-parceiros";
import { getIndicacoesByParceiro } from "@/lib/db-indicacoes";
import { getAllLeads } from "@/lib/db-admin";
import { getAllClientes } from "@/lib/db-clientes";
import { ParceiroDetailSections, type VinculoOption } from "@/components/admin/ParceiroDetailSections";

export default async function ParceiroDetailPage(
  props: PageProps<"/admin/parcerias/[id]">,
) {
  const { id } = await props.params;

  let parceiro;
  let indicacoes;
  let leads;
  let clientes;
  try {
    parceiro = await getParceiroById(id);
    indicacoes = await getIndicacoesByParceiro(id);
    leads = await getAllLeads();
    clientes = await getAllClientes();
  } catch {
    redirect("/login");
  }

  if (!parceiro) notFound();

  const vinculoOptions: VinculoOption[] = [
    ...leads.map((lead) => ({ value: `lead:${lead.id}`, label: `Lead: ${lead.name}` })),
    ...clientes.map((cliente) => ({
      value: `cliente:${cliente.id}`,
      label: `Cliente: ${cliente.nome_razao_social}`,
    })),
  ];

  return (
    <ParceiroDetailSections
      parceiro={parceiro}
      initialIndicacoes={indicacoes}
      vinculoOptions={vinculoOptions}
    />
  );
}

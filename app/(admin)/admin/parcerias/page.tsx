import { redirect } from "next/navigation";
import { getAllParceiros } from "@/lib/db-parceiros";
import { getAllIndicacoes } from "@/lib/db-indicacoes";
import { ParceirosAdminList, type ParceiroRow } from "@/components/admin/ParceirosAdminList";

export default async function AdminParceirosPage() {
  let parceiros;
  let indicacoes;
  try {
    parceiros = await getAllParceiros();
    indicacoes = await getAllIndicacoes();
  } catch {
    redirect("/login");
  }

  const enviadasPorParceiro = new Map<string, number>();
  const recebidasPorParceiro = new Map<string, number>();
  for (const indicacao of indicacoes) {
    const mapa = indicacao.direcao === "enviada" ? enviadasPorParceiro : recebidasPorParceiro;
    mapa.set(indicacao.parceiro_id, (mapa.get(indicacao.parceiro_id) ?? 0) + 1);
  }

  const rows: ParceiroRow[] = parceiros.map((parceiro) => ({
    ...parceiro,
    enviadas: enviadasPorParceiro.get(parceiro.id) ?? 0,
    recebidas: recebidasPorParceiro.get(parceiro.id) ?? 0,
  }));

  return <ParceirosAdminList initialParceiros={rows} />;
}

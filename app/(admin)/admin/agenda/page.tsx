import { redirect } from "next/navigation";
import { getAllAtividades } from "@/lib/db-atividades";
import { getAllCasos } from "@/lib/db-casos";
import { getAllFrentes } from "@/lib/db-frentes";
import { getAllClientes } from "@/lib/db-clientes";
import { isAgendaAtividade } from "@/lib/atividades-utils";
import { FRENTE_TIPO_LABELS } from "@/lib/admin-labels";
import { AgendaClient } from "@/components/admin/AgendaClient";
import type { AtividadeRow } from "@/components/admin/AtividadesAdminList";

export default async function AdminAgendaPage() {
  let atividades;
  let casos;
  let frentes;
  let clientes;
  try {
    atividades = await getAllAtividades();
    casos = await getAllCasos();
    frentes = await getAllFrentes();
    clientes = await getAllClientes();
  } catch {
    redirect("/login");
  }

  const casoById = new Map(casos.map((caso) => [caso.id, caso]));
  const frenteById = new Map(frentes.map((frente) => [frente.id, frente]));
  const clienteNomeById = new Map(
    clientes.map((cliente) => [cliente.id, cliente.nome_razao_social]),
  );

  const rows: AtividadeRow[] = atividades
    .filter(isAgendaAtividade)
    .map((atividade) => {
      let vinculo = "—";

      if (atividade.caso_frente_id) {
        const frente = frenteById.get(atividade.caso_frente_id);
        const caso = frente ? casoById.get(frente.caso_id) : undefined;
        if (frente && caso) {
          vinculo = `Caso: ${caso.titulo} · Frente ${FRENTE_TIPO_LABELS[frente.tipo]}${frente.orgao ? ` (${frente.orgao})` : ""}`;
        }
      } else if (atividade.caso_id) {
        const caso = casoById.get(atividade.caso_id);
        if (caso) vinculo = `Caso: ${caso.titulo}`;
      } else if (atividade.cliente_id) {
        const nome = clienteNomeById.get(atividade.cliente_id);
        if (nome) vinculo = `Cliente: ${nome}`;
      }

      return { ...atividade, vinculo };
    });

  return <AgendaClient initialAtividades={rows} />;
}

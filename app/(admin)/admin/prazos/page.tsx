import { redirect } from "next/navigation";
import { getAllPrazos } from "@/lib/db-prazos";
import { getAllCasos } from "@/lib/db-casos";
import { getAllFrentes } from "@/lib/db-frentes";
import { getAllClientes } from "@/lib/db-clientes";
import { FRENTE_TIPO_LABELS } from "@/lib/admin-labels";
import { PrazosAdminList, type PrazoRow } from "@/components/admin/PrazosAdminList";

export default async function AdminPrazosPage() {
  let prazos;
  let casos;
  let frentes;
  let clientes;
  try {
    prazos = await getAllPrazos();
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

  const rows: PrazoRow[] = prazos.map((prazo) => {
    let vinculo = "—";

    if (prazo.caso_frente_id) {
      const frente = frenteById.get(prazo.caso_frente_id);
      const caso = frente ? casoById.get(frente.caso_id) : undefined;
      if (frente && caso) {
        vinculo = `Caso: ${caso.titulo} · Frente ${FRENTE_TIPO_LABELS[frente.tipo]}${frente.orgao ? ` (${frente.orgao})` : ""}`;
      }
    } else if (prazo.caso_id) {
      const caso = casoById.get(prazo.caso_id);
      if (caso) vinculo = `Caso: ${caso.titulo}`;
    } else if (prazo.cliente_id) {
      const nome = clienteNomeById.get(prazo.cliente_id);
      if (nome) vinculo = `Cliente: ${nome}`;
    }

    return { ...prazo, vinculo };
  });

  return <PrazosAdminList initialPrazos={rows} />;
}

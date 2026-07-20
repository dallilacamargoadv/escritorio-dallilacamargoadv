import { redirect } from "next/navigation";
import { getAllAtividades } from "@/lib/db-atividades";
import { getAllCasos } from "@/lib/db-casos";
import { getAllFrentes } from "@/lib/db-frentes";
import { getAllClientes } from "@/lib/db-clientes";
import { getAllContratos } from "@/lib/db-contratos";
import { getAllDespesas } from "@/lib/db-despesas";
import { isDespesaVencida, isDespesaProxima } from "@/lib/financeiro-utils";
import { FRENTE_TIPO_LABELS } from "@/lib/admin-labels";
import {
  AtividadesAdminList,
  type AtividadeRow,
  type CasoAguardandoRow,
  type DespesaVencendoRow,
} from "@/components/admin/AtividadesAdminList";

const PROX_DIAS_DESPESA = 7;

export default async function AdminAtividadesPage() {
  let atividades;
  let casos;
  let frentes;
  let clientes;
  let contratos;
  let despesas;
  try {
    atividades = await getAllAtividades();
    casos = await getAllCasos();
    frentes = await getAllFrentes();
    clientes = await getAllClientes();
    contratos = await getAllContratos();
    despesas = await getAllDespesas();
  } catch {
    redirect("/login");
  }

  const casoById = new Map(casos.map((caso) => [caso.id, caso]));
  const frenteById = new Map(frentes.map((frente) => [frente.id, frente]));
  const clienteNomeById = new Map(
    clientes.map((cliente) => [cliente.id, cliente.nome_razao_social]),
  );
  const contratoById = new Map(contratos.map((contrato) => [contrato.id, contrato]));

  const rows: AtividadeRow[] = atividades.map((atividade) => {
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

  const casosAguardandoCliente: CasoAguardandoRow[] = casos
    .filter((caso) => caso.status === "aguardando_cliente")
    .map((caso) => {
      const contrato = contratoById.get(caso.contrato_id);
      const clienteNome = contrato ? clienteNomeById.get(contrato.cliente_id) : undefined;
      return {
        id: caso.id,
        titulo: caso.titulo,
        clienteNome: clienteNome ?? "—",
      };
    });

  const despesasVencendo: DespesaVencendoRow[] = despesas
    .filter((despesa) => isDespesaProxima(despesa, PROX_DIAS_DESPESA))
    .map((despesa) => ({
      id: despesa.id,
      descricao: despesa.descricao,
      valor: despesa.valor,
      vencimento: despesa.vencimento,
      vencida: isDespesaVencida(despesa),
    }));

  return (
    <AtividadesAdminList
      initialAtividades={rows}
      casosAguardandoCliente={casosAguardandoCliente}
      despesasVencendo={despesasVencendo}
    />
  );
}

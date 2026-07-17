import { redirect } from "next/navigation";
import { getAllContratos } from "@/lib/db-contratos";
import { getAllClientes } from "@/lib/db-clientes";
import { getAllCasos } from "@/lib/db-casos";
import { getAllLancamentos, type Lancamento } from "@/lib/db-financeiro";
import { isLancamentoAtrasado } from "@/lib/financeiro-utils";
import {
  RecorrentesAdminList,
  type RecorrenteRow,
} from "@/components/admin/RecorrentesAdminList";

export default async function AdminRecorrentesPage() {
  let contratos;
  let clientes;
  let casos;
  let lancamentos;
  try {
    contratos = await getAllContratos();
    clientes = await getAllClientes();
    casos = await getAllCasos();
    lancamentos = await getAllLancamentos();
  } catch {
    redirect("/login");
  }

  const recorrentes = contratos.filter((contrato) => contrato.tipo === "recorrente");

  const clienteNomeById = new Map(
    clientes.map((cliente) => [cliente.id, cliente.nome_razao_social]),
  );

  const casosCountByContrato = new Map<string, number>();
  for (const caso of casos) {
    casosCountByContrato.set(
      caso.contrato_id,
      (casosCountByContrato.get(caso.contrato_id) ?? 0) + 1,
    );
  }

  // `lancamentos` já vem ordenado por vencimento ascendente — o primeiro
  // pendente encontrado por contrato é o próximo vencimento.
  const proximoVencimentoByContrato = new Map<string, Lancamento>();
  for (const lancamento of lancamentos) {
    if (lancamento.status !== "pendente") continue;
    if (!proximoVencimentoByContrato.has(lancamento.contrato_id)) {
      proximoVencimentoByContrato.set(lancamento.contrato_id, lancamento);
    }
  }

  const rows: RecorrenteRow[] = recorrentes.map((contrato) => {
    const proximo = proximoVencimentoByContrato.get(contrato.id) ?? null;
    return {
      ...contrato,
      clienteNome: clienteNomeById.get(contrato.cliente_id) ?? "—",
      casosCount: casosCountByContrato.get(contrato.id) ?? 0,
      proximoVencimento: proximo?.vencimento ?? null,
      proximoVencimentoAtrasado: proximo ? isLancamentoAtrasado(proximo) : false,
    };
  });

  return <RecorrentesAdminList initialContratos={rows} />;
}

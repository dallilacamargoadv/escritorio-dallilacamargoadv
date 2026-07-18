import type { Lead } from "@/lib/db-admin";
import type { LeadFormType } from "@/lib/db-leads";
import type { Contrato } from "@/lib/db-contratos";
import type { Cliente } from "@/lib/db-clientes";
import type { Caso } from "@/lib/db-casos";
import type { Lancamento } from "@/lib/db-financeiro";
import type { Prazo } from "@/lib/db-prazos";
import { isLancamentoAtrasado } from "@/lib/financeiro-utils";
import { FORM_TYPE_LABELS } from "@/lib/admin-labels";
import { isWithinRange, type ResolvedRange } from "@/lib/date-range";

const DAY_MS = 24 * 60 * 60 * 1000;

function computeSlaPercent(leads: Lead[]) {
  const now = Date.now();
  const metSla = leads.filter((lead) => {
    if (lead.status === "leads") {
      return !lead.sla_due_at || new Date(lead.sla_due_at).getTime() > now;
    }
    if (!lead.first_contacted_at || !lead.sla_due_at) return true;
    return (
      new Date(lead.first_contacted_at).getTime() <= new Date(lead.sla_due_at).getTime()
    );
  }).length;
  return leads.length > 0 ? Math.round((metSla / leads.length) * 100) : 100;
}

export interface OverviewKpis {
  // "agora" — foto do momento, não respondem ao filtro de período
  mrr: number;
  inadimplencia: number;
  faturasVencidas: number;
  clientesAtivos: number;
  contratosAtivos: number;
  aRenovar30d: number;
  casosAbertos: number;
  prazos30d: number;
  // "período" — respondem ao filtro selecionado
  receitaPeriodo: number;
  slaPercentPeriodo: number;
  leadsPeriodo: number;
  conversoesPeriodo: number;
  leadsPorAreaPeriodo: { formType: LeadFormType; label: string; count: number }[];
}

export function computeOverviewKpis({
  leads,
  contratos,
  clientes,
  casos,
  lancamentos,
  prazos,
  range,
}: {
  leads: Lead[];
  contratos: Contrato[];
  clientes: Cliente[];
  casos: Caso[];
  lancamentos: Lancamento[];
  prazos: Prazo[];
  range: ResolvedRange;
}): OverviewKpis {
  const now = Date.now();

  const mrr = contratos
    .filter((c) => c.tipo === "recorrente" && c.status === "assinado")
    .reduce((sum, c) => sum + (c.valor ?? 0), 0);

  const lancamentosAtrasados = lancamentos.filter(isLancamentoAtrasado);
  const inadimplencia = lancamentosAtrasados.reduce((sum, l) => sum + l.valor, 0);

  const clientesAtivos = new Set(
    contratos.filter((c) => c.status === "assinado").map((c) => c.cliente_id),
  ).size;

  const contratosAtivos = contratos.filter((c) => c.status === "assinado");

  const proximoVencimentoByContrato = new Map<string, Lancamento>();
  for (const l of lancamentos) {
    if (l.status !== "pendente") continue;
    if (!proximoVencimentoByContrato.has(l.contrato_id)) {
      proximoVencimentoByContrato.set(l.contrato_id, l);
    }
  }
  const aRenovar30d = contratosAtivos.filter((c) => {
    if (c.tipo !== "recorrente") return false;
    const proximo = proximoVencimentoByContrato.get(c.id);
    if (!proximo) return false;
    const diff = new Date(proximo.vencimento).getTime() - now;
    return diff >= 0 && diff <= 30 * DAY_MS;
  }).length;

  const casosAbertos = casos.filter((c) =>
    ["aberto", "em_andamento", "aguardando_cliente"].includes(c.status),
  ).length;

  const prazos30d = prazos.filter(
    (p) => p.status === "pendente" && new Date(p.data).getTime() <= now + 30 * DAY_MS,
  ).length;

  const receitaPeriodo = lancamentos
    .filter((l) => l.status === "pago" && l.pago_em && isWithinRange(l.pago_em, range))
    .reduce((sum, l) => sum + l.valor, 0);

  const leadsPeriodo = leads.filter((l) => isWithinRange(l.created_at, range));
  const slaPercentPeriodo = computeSlaPercent(leadsPeriodo);

  const leadsPorAreaPeriodo = Object.keys(FORM_TYPE_LABELS).map((formType) => ({
    formType: formType as LeadFormType,
    label: FORM_TYPE_LABELS[formType],
    count: leadsPeriodo.filter((l) => l.form_type === formType).length,
  }));

  const conversoesPeriodo = clientes.filter(
    (c) => c.lead_id && isWithinRange(c.created_at, range),
  ).length;

  return {
    mrr,
    inadimplencia,
    faturasVencidas: lancamentosAtrasados.length,
    clientesAtivos,
    contratosAtivos: contratosAtivos.length,
    aRenovar30d,
    casosAbertos,
    prazos30d,
    receitaPeriodo,
    slaPercentPeriodo,
    leadsPeriodo: leadsPeriodo.length,
    conversoesPeriodo,
    leadsPorAreaPeriodo,
  };
}

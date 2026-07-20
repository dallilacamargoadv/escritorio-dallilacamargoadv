import type { Lead, LeadOrigem } from "@/lib/db-admin";
import type { LeadFormType } from "@/lib/db-leads";
import type { Contrato } from "@/lib/db-contratos";
import type { Cliente } from "@/lib/db-clientes";
import type { Caso } from "@/lib/db-casos";
import type { Lancamento } from "@/lib/db-financeiro";
import type { Atividade } from "@/lib/db-atividades";
import { isLancamentoAtrasado } from "@/lib/financeiro-utils";
import { FORM_TYPE_LABELS, ORIGEM_LABELS } from "@/lib/admin-labels";
import { isWithinRange, type ResolvedRange } from "@/lib/date-range";

const DAY_MS = 24 * 60 * 60 * 1000;

export function leadCumpriuSla(lead: Lead): boolean {
  const now = Date.now();
  if (lead.status === "leads") {
    return !lead.sla_due_at || new Date(lead.sla_due_at).getTime() > now;
  }
  if (!lead.first_contacted_at || !lead.sla_due_at) return true;
  return new Date(lead.first_contacted_at).getTime() <= new Date(lead.sla_due_at).getTime();
}

function computeSlaPercent(leads: Lead[]) {
  const metSla = leads.filter(leadCumpriuSla).length;
  return leads.length > 0 ? Math.round((metSla / leads.length) * 100) : 100;
}

export interface OverviewKpis {
  // "agora" — foto do momento, não respondem ao filtro de período
  mrr: number;
  contratosRecorrentesAtivos: Contrato[];
  inadimplencia: number;
  faturasVencidas: number;
  lancamentosAtrasados: Lancamento[];
  clientesAtivos: number;
  clientesAtivosList: Cliente[];
  contratosAtivos: number;
  contratosAtivosList: Contrato[];
  aRenovar30d: number;
  casosAbertos: number;
  casosAbertosList: Caso[];
  atividades30d: number;
  atividades30dList: Atividade[];
  // "período" — respondem ao filtro selecionado
  receitaPeriodo: number;
  receitaPeriodoList: Lancamento[];
  slaPercentPeriodo: number;
  leadsPeriodo: number;
  leadsPeriodoList: Lead[];
  conversoesPeriodo: number;
  conversoesPeriodoList: Cliente[];
  leadsPorAreaPeriodo: {
    formType: LeadFormType;
    label: string;
    count: number;
    leads: Lead[];
  }[];
  leadsPorOrigemPeriodo: {
    origem: LeadOrigem;
    label: string;
    count: number;
    conversoes: number;
  }[];
}

export function computeOverviewKpis({
  leads,
  contratos,
  clientes,
  casos,
  lancamentos,
  atividades,
  range,
}: {
  leads: Lead[];
  contratos: Contrato[];
  clientes: Cliente[];
  casos: Caso[];
  lancamentos: Lancamento[];
  atividades: Atividade[];
  range: ResolvedRange;
}): OverviewKpis {
  const now = Date.now();

  const contratosRecorrentesAtivos = contratos.filter(
    (c) => c.tipo === "recorrente" && c.status === "assinado",
  );
  const mrr = contratosRecorrentesAtivos.reduce((sum, c) => sum + (c.valor ?? 0), 0);

  const lancamentosAtrasados = lancamentos.filter(isLancamentoAtrasado);
  const inadimplencia = lancamentosAtrasados.reduce((sum, l) => sum + l.valor, 0);

  const clienteIdsAtivos = new Set(
    contratos.filter((c) => c.status === "assinado").map((c) => c.cliente_id),
  );
  const clientesAtivosList = clientes.filter((c) => clienteIdsAtivos.has(c.id));

  const contratosAtivosList = contratos.filter((c) => c.status === "assinado");

  const proximoVencimentoByContrato = new Map<string, Lancamento>();
  for (const l of lancamentos) {
    if (l.status !== "pendente") continue;
    if (!proximoVencimentoByContrato.has(l.contrato_id)) {
      proximoVencimentoByContrato.set(l.contrato_id, l);
    }
  }
  const aRenovar30d = contratosAtivosList.filter((c) => {
    if (c.tipo !== "recorrente") return false;
    const proximo = proximoVencimentoByContrato.get(c.id);
    if (!proximo) return false;
    const diff = new Date(proximo.vencimento).getTime() - now;
    return diff >= 0 && diff <= 30 * DAY_MS;
  }).length;

  const casosAbertosList = casos.filter((c) =>
    ["aberto", "em_andamento", "aguardando_cliente"].includes(c.status),
  );

  const atividades30dList = atividades.filter(
    (a) => a.status === "pendente" && new Date(a.data).getTime() <= now + 30 * DAY_MS,
  );

  const receitaPeriodoList = lancamentos.filter(
    (l) => l.status === "pago" && l.pago_em && isWithinRange(l.pago_em, range),
  );
  const receitaPeriodo = receitaPeriodoList.reduce((sum, l) => sum + l.valor, 0);

  const leadsPeriodoList = leads.filter((l) => isWithinRange(l.created_at, range));
  const slaPercentPeriodo = computeSlaPercent(leadsPeriodoList);

  const leadsPorAreaPeriodo = Object.keys(FORM_TYPE_LABELS).map((formType) => {
    const leadsDaArea = leadsPeriodoList.filter((l) => l.form_type === formType);
    return {
      formType: formType as LeadFormType,
      label: FORM_TYPE_LABELS[formType],
      count: leadsDaArea.length,
      leads: leadsDaArea,
    };
  });

  const conversoesPeriodoList = clientes.filter(
    (c) => c.lead_id && isWithinRange(c.created_at, range),
  );

  const leadsPorOrigemPeriodo = (Object.keys(ORIGEM_LABELS) as LeadOrigem[]).map(
    (origem) => {
      const leadsDaOrigem = leadsPeriodoList.filter((l) => l.origem === origem);
      const leadIds = new Set(leadsDaOrigem.map((l) => l.id));
      const conversoes = conversoesPeriodoList.filter(
        (c) => c.lead_id && leadIds.has(c.lead_id),
      ).length;
      return {
        origem,
        label: ORIGEM_LABELS[origem],
        count: leadsDaOrigem.length,
        conversoes,
      };
    },
  );

  return {
    mrr,
    contratosRecorrentesAtivos,
    inadimplencia,
    faturasVencidas: lancamentosAtrasados.length,
    lancamentosAtrasados,
    clientesAtivos: clientesAtivosList.length,
    clientesAtivosList,
    contratosAtivos: contratosAtivosList.length,
    contratosAtivosList,
    aRenovar30d,
    casosAbertos: casosAbertosList.length,
    casosAbertosList,
    atividades30d: atividades30dList.length,
    atividades30dList,
    receitaPeriodo,
    receitaPeriodoList,
    slaPercentPeriodo,
    leadsPeriodo: leadsPeriodoList.length,
    leadsPeriodoList,
    conversoesPeriodo: conversoesPeriodoList.length,
    conversoesPeriodoList,
    leadsPorAreaPeriodo,
    leadsPorOrigemPeriodo,
  };
}

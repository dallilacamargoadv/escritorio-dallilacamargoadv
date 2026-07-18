import type { LeadStatus } from "@/lib/db-admin";
import type { TipoPessoa } from "@/lib/db-clientes";
import type { ContratoTipo, ContratoStatus } from "@/lib/db-contratos";
import type { CasoStatus } from "@/lib/db-casos";
import type { FrenteTipo, FrenteStatus } from "@/lib/db-frentes";
import type { FinanceiroStatus } from "@/lib/db-financeiro";
import type { NotificacaoTipo } from "@/lib/db-notificacoes";
import type { PrazoTipo, PrazoStatus } from "@/lib/db-prazos";

export const FORM_TYPE_LABELS: Record<string, string> = {
  contratos: "Contratos Digitais",
  propriedade_intelectual: "Propriedade Intelectual",
  contas_e_plataformas: "Contas e Plataformas",
  golpes_virtuais: "Golpes Virtuais",
  assessoria_estrategica: "Assessoria Estratégica",
};

/** Paleta categórica fixa das 5 áreas — ver nota de validação em app/globals.css. */
export const FORM_TYPE_CHART_COLORS: Record<string, string> = {
  contratos: "var(--chart-1)",
  propriedade_intelectual: "var(--chart-2)",
  contas_e_plataformas: "var(--chart-3)",
  golpes_virtuais: "var(--chart-4)",
  assessoria_estrategica: "var(--chart-5)",
};
export const CHART_COLOR_OUTROS = "var(--chart-6)";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  leads: "Leads",
  contactados: "Contactados",
  em_andamento: "Em andamento",
  proposta_enviada: "Proposta enviada",
  link_enviado: "Link enviado",
  f1_01_dia: "F1 · 01 dia",
  f2_02_dias: "F2 · 02 dias",
  f3_03_dias: "F3 · 03 dias",
  f4_05_dias: "F4 · 05 dias",
  f5_07_dias: "F5 · 07 dias",
  f6_10_dias: "F6 · 10 dias",
  f7_12_dias: "F7 · 12 dias",
  f8_15_dias: "F8 · 15 dias (encerramento)",
  grupo_criado: "Grupo criado",
  reuniao_agendada: "Reunião agendada",
  salesfarming: "Salesfarming",
  perdido: "Perdido",
  cliente: "Cliente",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  leads: "text-gold border-gold",
  contactados: "text-gold border-gold",
  em_andamento: "text-warning border-warning",
  proposta_enviada: "text-warning border-warning",
  link_enviado: "text-warning border-warning",
  f1_01_dia: "text-warning border-warning",
  f2_02_dias: "text-warning border-warning",
  f3_03_dias: "text-warning border-warning",
  f4_05_dias: "text-warning border-warning",
  f5_07_dias: "text-warning border-warning",
  f6_10_dias: "text-warning border-warning",
  f7_12_dias: "text-warning border-warning",
  f8_15_dias: "text-error border-error",
  grupo_criado: "text-success border-success",
  reuniao_agendada: "text-success border-success",
  salesfarming: "text-ink-dim border-hairline-strong",
  perdido: "text-ink-dim border-hairline-strong",
  cliente: "text-success border-success",
};

export const TIPO_PESSOA_LABELS: Record<TipoPessoa, string> = {
  pf: "Pessoa Física",
  pj: "Pessoa Jurídica",
};

export const CONTRATO_TIPO_LABELS: Record<ContratoTipo, string> = {
  projeto: "Projeto",
  recorrente: "Recorrente",
};

export const CONTRATO_STATUS_LABELS: Record<ContratoStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  assinado: "Assinado",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export const CONTRATO_STATUS_COLORS: Record<ContratoStatus, string> = {
  rascunho: "text-ink-dim border-hairline-strong",
  enviado: "text-warning border-warning",
  assinado: "text-success border-success",
  encerrado: "text-gold border-gold",
  cancelado: "text-error border-error",
};

export const CASO_STATUS_LABELS: Record<CasoStatus, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  concluido: "Concluído",
  arquivado: "Arquivado",
};

export const CASO_STATUS_COLORS: Record<CasoStatus, string> = {
  aberto: "text-gold border-gold",
  em_andamento: "text-warning border-warning",
  aguardando_cliente: "text-warning border-warning",
  concluido: "text-success border-success",
  arquivado: "text-ink-dim border-hairline-strong",
};

export const FRENTE_TIPO_LABELS: Record<FrenteTipo, string> = {
  extrajudicial: "Extrajudicial",
  judicial: "Judicial",
  administrativo: "Administrativo (ex.: INPI)",
};

export const FRENTE_STATUS_LABELS: Record<FrenteStatus, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  arquivada: "Arquivada",
};

export const FRENTE_STATUS_COLORS: Record<FrenteStatus, string> = {
  aberta: "text-gold border-gold",
  em_andamento: "text-warning border-warning",
  concluida: "text-success border-success",
  arquivada: "text-ink-dim border-hairline-strong",
};

export const FINANCEIRO_STATUS_LABELS: Record<FinanceiroStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
};

export const NOTIFICACAO_TIPO_LABELS: Record<NotificacaoTipo, string> = {
  lead_sla: "SLA de lead",
  financeiro_vencimento: "Vencimento financeiro",
  blog_rascunho: "Rascunho de blog parado",
};

export const PRAZO_TIPO_LABELS: Record<PrazoTipo, string> = {
  processual: "Processual",
  compromisso: "Compromisso",
  tarefa: "Tarefa",
};

export const PRAZO_STATUS_LABELS: Record<PrazoStatus, string> = {
  pendente: "Pendente",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const PRAZO_STATUS_COLORS: Record<PrazoStatus, string> = {
  pendente: "text-gold border-gold",
  concluido: "text-success border-success",
  cancelado: "text-ink-dim border-hairline-strong",
};

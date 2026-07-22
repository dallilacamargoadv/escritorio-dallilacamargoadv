import type { LeadStatus, LeadOrigem } from "@/lib/db-admin";
import type { TipoPessoa } from "@/lib/db-clientes";
import type { ContratoTipo, ContratoStatus } from "@/lib/db-contratos";
import type { CasoStatus, CasoPrioridade } from "@/lib/db-casos";
import type { FrenteTipo, FrenteStatus } from "@/lib/db-frentes";
import type { FinanceiroStatus } from "@/lib/db-financeiro";
import type { NotificacaoTipo } from "@/lib/db-notificacoes";
import type { AtividadeTipo, AtividadeStatus } from "@/lib/db-atividades";
import type { DespesaStatus, DespesaRecorrencia } from "@/lib/db-despesas";
import type { IndicacaoDirecao } from "@/lib/db-indicacoes";

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

export const ORIGEM_LABELS: Record<LeadOrigem, string> = {
  site: "Site",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  indicacao: "Indicação",
  organico: "Orgânico",
  outro: "Outro",
};

/** Reaproveita a mesma paleta categórica já validada das 5 áreas (seção 3 do
 * HANDOFF) — não é uma paleta nova, só um mapeamento diferente dos mesmos
 * tokens fixos, já que são no máximo 6 valores relevantes (+ "outro"). */
export const ORIGEM_CHART_COLORS: Record<LeadOrigem, string> = {
  site: "var(--chart-1)",
  instagram: "var(--chart-2)",
  linkedin: "var(--chart-3)",
  whatsapp: "var(--chart-4)",
  indicacao: "var(--chart-5)",
  organico: "var(--chart-6)",
  outro: "var(--ink-dim)",
};

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

export const INDICACAO_DIRECAO_LABELS: Record<IndicacaoDirecao, string> = {
  enviada: "Enviada",
  recebida: "Recebida",
};

export const INDICACAO_DIRECAO_COLORS: Record<IndicacaoDirecao, string> = {
  enviada: "text-wine border-wine",
  recebida: "text-success border-success",
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

export const CASO_PRIORIDADE_LABELS: Record<CasoPrioridade, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const CASO_PRIORIDADE_COLORS: Record<CasoPrioridade, string> = {
  baixa: "text-success border-success",
  media: "text-gold border-gold",
  alta: "text-warning border-warning",
  urgente: "text-error border-error",
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
  cancelado: "Cancelado",
};

export const FINANCEIRO_STATUS_COLORS: Record<FinanceiroStatus, string> = {
  pendente: "text-gold border-gold",
  pago: "text-success border-success",
  cancelado: "text-ink-dim border-hairline-strong",
};

export const DESPESA_STATUS_LABELS: Record<DespesaStatus, string> = {
  a_pagar: "A pagar",
  pago: "Pago",
  cancelado: "Cancelado",
};

export const DESPESA_STATUS_COLORS: Record<DespesaStatus, string> = {
  a_pagar: "text-gold border-gold",
  pago: "text-success border-success",
  cancelado: "text-ink-dim border-hairline-strong",
};

export const DESPESA_RECORRENCIA_LABELS: Record<DespesaRecorrencia, string> = {
  nenhuma: "Não recorrente",
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export const NOTIFICACAO_TIPO_LABELS: Record<NotificacaoTipo, string> = {
  lead_sla: "SLA de lead",
  financeiro_vencimento: "Vencimento financeiro",
  blog_rascunho: "Rascunho de blog parado",
};

export const ATIVIDADE_TIPO_LABELS: Record<AtividadeTipo, string> = {
  processual: "Processual",
  compromisso: "Compromisso",
  tarefa: "Tarefa",
  documento_pendente: "Documento pendente",
  tarefa_delegada: "Tarefa delegada",
  checklist_diario: "Checklist diário",
  audiencia: "Audiência",
  reuniao_cliente: "Reunião com cliente",
  peca_prazo: "Prazo de peça",
};

export const ATIVIDADE_STATUS_LABELS: Record<AtividadeStatus, string> = {
  pendente: "Pendente",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const ATIVIDADE_STATUS_COLORS: Record<AtividadeStatus, string> = {
  pendente: "text-gold border-gold",
  concluido: "text-success border-success",
  cancelado: "text-ink-dim border-hairline-strong",
};

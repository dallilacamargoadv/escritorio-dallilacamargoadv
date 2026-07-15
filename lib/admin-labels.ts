import type { LeadStatus } from "@/lib/db-admin";
import type { TipoPessoa } from "@/lib/db-clientes";
import type { ContratoTipo, ContratoStatus } from "@/lib/db-contratos";
import type { CasoStatus } from "@/lib/db-casos";

export const FORM_TYPE_LABELS: Record<string, string> = {
  contratos: "Contratos Digitais",
  propriedade_intelectual: "Propriedade Intelectual",
  contas_e_plataformas: "Contas e Plataformas",
  golpes_virtuais: "Golpes Virtuais",
  assessoria_estrategica: "Assessoria Estratégica",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  qualificado: "Qualificado",
  proposta: "Proposta",
  cliente: "Cliente",
  perdido: "Perdido",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: "text-gold border-gold",
  em_contato: "text-warning border-warning",
  qualificado: "text-warning border-warning",
  proposta: "text-warning border-warning",
  cliente: "text-success border-success",
  perdido: "text-ink-dim border-hairline-strong",
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

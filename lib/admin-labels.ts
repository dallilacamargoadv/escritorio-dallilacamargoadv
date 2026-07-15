import type { LeadStatus } from "@/lib/db-admin";

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

import { createClient } from "@/lib/supabase/server";
import type { LeadFormType } from "@/lib/db-leads";

export type CasoStatus =
  | "aberto"
  | "em_andamento"
  | "aguardando_cliente"
  | "concluido"
  | "arquivado";

export type CasoPrioridade = "baixa" | "media" | "alta" | "urgente";

export interface Caso {
  id: string;
  contrato_id: string;
  area: LeadFormType;
  titulo: string;
  status: CasoStatus;
  aberto_em: string;
  encerrado_em: string | null;
  prioridade: CasoPrioridade;
  sla_horas: number | null;
  categoria: string | null;
  responsavel: string | null;
}

export interface CasoInput {
  contrato_id: string;
  area: LeadFormType;
  titulo: string;
  status: CasoStatus;
  prioridade: CasoPrioridade;
  sla_horas: number | null;
  categoria: string | null;
  responsavel: string | null;
}

export async function getAllCasos(contratoId?: string): Promise<Caso[]> {
  const supabase = await createClient();
  let query = supabase
    .from("casos")
    .select("*")
    .order("aberto_em", { ascending: false });

  if (contratoId) {
    query = query.eq("contrato_id", contratoId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Caso[];
}

export async function getCasoById(id: string): Promise<Caso | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("casos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Caso | null;
}

export async function createCaso(input: CasoInput): Promise<Caso> {
  const supabase = await createClient();

  const { data: contrato, error: contratoError } = await supabase
    .from("contratos")
    .select("status")
    .eq("id", input.contrato_id)
    .single();

  if (contratoError) throw contratoError;
  if (contrato.status !== "assinado") {
    throw new Error("Só é possível abrir um caso sob um contrato assinado.");
  }

  const { data, error } = await supabase
    .from("casos")
    .insert({
      contrato_id: input.contrato_id,
      area: input.area,
      titulo: input.titulo,
      status: input.status,
      prioridade: input.prioridade,
      sla_horas: input.sla_horas,
      categoria: input.categoria,
      responsavel: input.responsavel,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Caso;
}

export async function updateCaso(id: string, input: CasoInput): Promise<Caso> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    area: input.area,
    titulo: input.titulo,
    status: input.status,
    prioridade: input.prioridade,
    sla_horas: input.sla_horas,
    categoria: input.categoria,
    responsavel: input.responsavel,
  };

  if (input.status === "concluido" || input.status === "arquivado") {
    const { data: current } = await supabase
      .from("casos")
      .select("encerrado_em")
      .eq("id", id)
      .single();
    if (!current?.encerrado_em) {
      updates.encerrado_em = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("casos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Caso;
}

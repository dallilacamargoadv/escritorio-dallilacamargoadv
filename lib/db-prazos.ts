import { createClient } from "@/lib/supabase/server";

export type PrazoTipo = "processual" | "compromisso" | "tarefa";
export type PrazoStatus = "pendente" | "concluido" | "cancelado";

export interface Prazo {
  id: string;
  tipo: PrazoTipo;
  titulo: string;
  data: string;
  hora: string | null;
  caso_frente_id: string | null;
  caso_id: string | null;
  cliente_id: string | null;
  status: PrazoStatus;
  concluido_em: string | null;
  created_at: string;
}

export interface PrazoInput {
  tipo: PrazoTipo;
  titulo: string;
  data: string;
  hora: string | null;
  caso_frente_id: string | null;
  caso_id: string | null;
  cliente_id: string | null;
  status: PrazoStatus;
}

export async function getUrgentPrazosCount(): Promise<number> {
  const supabase = await createClient();
  const limite = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { count, error } = await supabase
    .from("prazos")
    .select("*", { count: "exact", head: true })
    .eq("status", "pendente")
    .lte("data", limite);

  if (error) throw error;
  return count ?? 0;
}

export async function getAllPrazos(): Promise<Prazo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prazos")
    .select("*")
    .order("data", { ascending: true });

  if (error) throw error;
  return data as Prazo[];
}

export async function getPrazoById(id: string): Promise<Prazo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prazos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Prazo | null;
}

export async function createPrazo(input: PrazoInput): Promise<Prazo> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prazos")
    .insert({
      tipo: input.tipo,
      titulo: input.titulo,
      data: input.data,
      hora: input.hora,
      caso_frente_id: input.caso_frente_id,
      caso_id: input.caso_id,
      cliente_id: input.cliente_id,
      status: input.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Prazo;
}

export async function updatePrazo(id: string, input: PrazoInput): Promise<Prazo> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    tipo: input.tipo,
    titulo: input.titulo,
    data: input.data,
    hora: input.hora,
    caso_frente_id: input.caso_frente_id,
    caso_id: input.caso_id,
    cliente_id: input.cliente_id,
    status: input.status,
  };

  if (input.status === "concluido") {
    const { data: current } = await supabase
      .from("prazos")
      .select("concluido_em")
      .eq("id", id)
      .single();
    if (!current?.concluido_em) {
      updates.concluido_em = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("prazos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Prazo;
}

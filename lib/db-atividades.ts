import { createClient } from "@/lib/supabase/server";

export type AtividadeTipo =
  | "processual"
  | "compromisso"
  | "tarefa"
  | "documento_pendente"
  | "tarefa_delegada"
  | "checklist_diario";
export type AtividadeStatus = "pendente" | "concluido" | "cancelado";

export interface Atividade {
  id: string;
  tipo: AtividadeTipo;
  titulo: string;
  data: string;
  hora: string | null;
  caso_frente_id: string | null;
  caso_id: string | null;
  cliente_id: string | null;
  status: AtividadeStatus;
  concluido_em: string | null;
  created_at: string;
  visivel_cliente: boolean;
}

export interface AtividadeInput {
  tipo: AtividadeTipo;
  titulo: string;
  data: string;
  hora: string | null;
  caso_frente_id: string | null;
  caso_id: string | null;
  cliente_id: string | null;
  status: AtividadeStatus;
  visivel_cliente: boolean;
}

export async function getUrgentAtividadesCount(): Promise<number> {
  const supabase = await createClient();
  const limite = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { count, error } = await supabase
    .from("atividades")
    .select("*", { count: "exact", head: true })
    .eq("status", "pendente")
    .lte("data", limite);

  if (error) throw error;
  return count ?? 0;
}

export async function getAllAtividades(): Promise<Atividade[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("atividades")
    .select("*")
    .order("data", { ascending: true });

  if (error) throw error;
  return data as Atividade[];
}

export async function getAtividadeById(id: string): Promise<Atividade | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("atividades")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Atividade | null;
}

export async function getAtividadesByCaso(
  casoId: string,
  frenteIds: string[],
): Promise<Atividade[]> {
  const supabase = await createClient();
  const filtros = [`caso_id.eq.${casoId}`];
  if (frenteIds.length > 0) {
    filtros.push(`caso_frente_id.in.(${frenteIds.join(",")})`);
  }

  const { data, error } = await supabase
    .from("atividades")
    .select("*")
    .or(filtros.join(","))
    .order("data", { ascending: true });

  if (error) throw error;
  return data as Atividade[];
}

export async function createAtividade(input: AtividadeInput): Promise<Atividade> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("atividades")
    .insert({
      tipo: input.tipo,
      titulo: input.titulo,
      data: input.data,
      hora: input.hora,
      caso_frente_id: input.caso_frente_id,
      caso_id: input.caso_id,
      cliente_id: input.cliente_id,
      status: input.status,
      visivel_cliente: input.visivel_cliente,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Atividade;
}

export async function updateAtividade(
  id: string,
  input: AtividadeInput,
): Promise<Atividade> {
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
    visivel_cliente: input.visivel_cliente,
  };

  if (input.status === "concluido") {
    const { data: current } = await supabase
      .from("atividades")
      .select("concluido_em")
      .eq("id", id)
      .single();
    if (!current?.concluido_em) {
      updates.concluido_em = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("atividades")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Atividade;
}

export async function deleteAtividade(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("atividades").delete().eq("id", id);
  if (error) throw error;
}

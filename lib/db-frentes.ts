import { createClient } from "@/lib/supabase/server";

export type FrenteTipo = "extrajudicial" | "judicial" | "administrativo";
export type FrenteStatus = "aberta" | "em_andamento" | "concluida" | "arquivada";

export interface Frente {
  id: string;
  caso_id: string;
  tipo: FrenteTipo;
  orgao: string | null;
  numero_processo: string | null;
  status: FrenteStatus;
  aberta_em: string;
  encerrada_em: string | null;
  visivel_cliente: boolean;
  tribunal: string | null;
  vara: string | null;
  comarca: string | null;
  classe_processual: string | null;
  assunto: string | null;
  polo_ativo: string | null;
  polo_passivo: string | null;
  valor_causa: number | null;
  data_distribuicao: string | null;
  ultima_movimentacao: string | null;
  ultima_movimentacao_em: string | null;
  etiquetas: string[];
  segredo_justica: boolean;
}

export interface FrenteInput {
  tipo: FrenteTipo;
  orgao: string;
  numero_processo: string;
  status: FrenteStatus;
  tribunal: string | null;
  vara: string | null;
  comarca: string | null;
  classe_processual: string | null;
  assunto: string | null;
  polo_ativo: string | null;
  polo_passivo: string | null;
  valor_causa: number | null;
  data_distribuicao: string | null;
  ultima_movimentacao: string | null;
  ultima_movimentacao_em: string | null;
  etiquetas: string[];
  segredo_justica: boolean;
}

export async function getAllFrentes(casoId?: string): Promise<Frente[]> {
  const supabase = await createClient();
  let query = supabase
    .from("caso_frentes")
    .select("*")
    .order("aberta_em", { ascending: false });

  if (casoId) {
    query = query.eq("caso_id", casoId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Frente[];
}

export async function createFrente(
  casoId: string,
  input: FrenteInput,
): Promise<Frente> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caso_frentes")
    .insert({
      caso_id: casoId,
      tipo: input.tipo,
      orgao: input.orgao,
      numero_processo: input.numero_processo,
      status: input.status,
      tribunal: input.tribunal,
      vara: input.vara,
      comarca: input.comarca,
      classe_processual: input.classe_processual,
      assunto: input.assunto,
      polo_ativo: input.polo_ativo,
      polo_passivo: input.polo_passivo,
      valor_causa: input.valor_causa,
      data_distribuicao: input.data_distribuicao,
      ultima_movimentacao: input.ultima_movimentacao,
      ultima_movimentacao_em: input.ultima_movimentacao_em,
      etiquetas: input.etiquetas,
      segredo_justica: input.segredo_justica,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Frente;
}

export async function updateFrente(
  id: string,
  input: FrenteInput,
): Promise<Frente> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    tipo: input.tipo,
    orgao: input.orgao,
    numero_processo: input.numero_processo,
    status: input.status,
    tribunal: input.tribunal,
    vara: input.vara,
    comarca: input.comarca,
    classe_processual: input.classe_processual,
    assunto: input.assunto,
    polo_ativo: input.polo_ativo,
    polo_passivo: input.polo_passivo,
    valor_causa: input.valor_causa,
    data_distribuicao: input.data_distribuicao,
    ultima_movimentacao: input.ultima_movimentacao,
    ultima_movimentacao_em: input.ultima_movimentacao_em,
    etiquetas: input.etiquetas,
    segredo_justica: input.segredo_justica,
  };

  if (input.status === "concluida" || input.status === "arquivada") {
    const { data: current } = await supabase
      .from("caso_frentes")
      .select("encerrada_em")
      .eq("id", id)
      .single();
    if (!current?.encerrada_em) {
      updates.encerrada_em = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("caso_frentes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Frente;
}

export async function setFrenteVisivelCliente(
  id: string,
  visivelCliente: boolean,
): Promise<Frente> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caso_frentes")
    .update({ visivel_cliente: visivelCliente })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Frente;
}

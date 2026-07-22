import { createClient } from "@/lib/supabase/server";

export type IndicacaoDirecao = "enviada" | "recebida";

export interface Indicacao {
  id: string;
  parceiro_id: string;
  direcao: IndicacaoDirecao;
  data: string;
  lead_id: string | null;
  cliente_id: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface IndicacaoInput {
  direcao: IndicacaoDirecao;
  data: string;
  lead_id: string | null;
  cliente_id: string | null;
  observacoes: string | null;
}

export async function getAllIndicacoes(): Promise<Indicacao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("indicacoes")
    .select("*")
    .order("data", { ascending: false });

  if (error) throw error;
  return data as Indicacao[];
}

export async function getIndicacoesByParceiro(
  parceiroId: string,
): Promise<Indicacao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("indicacoes")
    .select("*")
    .eq("parceiro_id", parceiroId)
    .order("data", { ascending: false });

  if (error) throw error;
  return data as Indicacao[];
}

export async function createIndicacao(
  parceiroId: string,
  input: IndicacaoInput,
): Promise<Indicacao> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("indicacoes")
    .insert({ parceiro_id: parceiroId, ...input })
    .select()
    .single();

  if (error) throw error;
  return data as Indicacao;
}

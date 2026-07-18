import { createClient } from "@/lib/supabase/server";

export type DespesaStatus = "a_pagar" | "pago" | "cancelado";
export type DespesaRecorrencia = "nenhuma" | "mensal" | "trimestral" | "semestral" | "anual";

export interface Despesa {
  id: string;
  categoria: string;
  subcategoria: string | null;
  descricao: string;
  fornecedor: string | null;
  valor: number;
  vencimento: string;
  pago_em: string | null;
  status: DespesaStatus;
  forma_pagamento: string | null;
  recorrencia: DespesaRecorrencia;
  centro_custo: string | null;
  observacoes: string | null;
  grupo_id: string | null;
  created_at: string;
}

export interface DespesaInput {
  categoria: string;
  subcategoria: string | null;
  descricao: string;
  fornecedor: string | null;
  valor: number;
  vencimento: string;
  status: DespesaStatus;
  forma_pagamento: string | null;
  recorrencia: DespesaRecorrencia;
  centro_custo: string | null;
  observacoes: string | null;
}

export async function getAllDespesas(): Promise<Despesa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("despesas")
    .select("*")
    .order("vencimento", { ascending: true });

  if (error) throw error;
  return data as Despesa[];
}

export async function getDespesaById(id: string): Promise<Despesa | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("despesas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Despesa | null;
}

export async function createDespesa(input: DespesaInput): Promise<Despesa> {
  const supabase = await createClient();
  const pago_em = input.status === "pago" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("despesas")
    .insert({ ...input, pago_em })
    .select()
    .single();

  if (error) throw error;
  return data as Despesa;
}

export async function updateDespesa(id: string, input: DespesaInput): Promise<Despesa> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { ...input };

  if (input.status === "pago") {
    const { data: current } = await supabase
      .from("despesas")
      .select("pago_em")
      .eq("id", id)
      .single();
    if (!current?.pago_em) {
      updates.pago_em = new Date().toISOString();
    }
  } else {
    updates.pago_em = null;
  }

  const { data, error } = await supabase
    .from("despesas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Despesa;
}

export async function deleteDespesa(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("despesas").delete().eq("id", id);
  if (error) throw error;
}

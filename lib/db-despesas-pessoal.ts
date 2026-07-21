import { createClient } from "@/lib/supabase/server";

export type DespesaPessoalStatus = "a_pagar" | "pago" | "cancelado";
export type DespesaPessoalRecorrencia =
  | "nenhuma"
  | "mensal"
  | "trimestral"
  | "semestral"
  | "anual";

export interface DespesaPessoal {
  id: string;
  categoria: string;
  subcategoria: string | null;
  descricao: string;
  fornecedor: string | null;
  valor: number;
  vencimento: string;
  pago_em: string | null;
  status: DespesaPessoalStatus;
  forma_pagamento: string | null;
  recorrencia: DespesaPessoalRecorrencia;
  centro_custo: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface DespesaPessoalInput {
  categoria: string;
  subcategoria: string | null;
  descricao: string;
  fornecedor: string | null;
  valor: number;
  vencimento: string;
  status: DespesaPessoalStatus;
  forma_pagamento: string | null;
  recorrencia: DespesaPessoalRecorrencia;
  centro_custo: string | null;
  observacoes: string | null;
}

export async function getAllDespesasPessoal(): Promise<DespesaPessoal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("despesas_pessoal")
    .select("*")
    .order("vencimento", { ascending: true });

  if (error) throw error;
  return data as DespesaPessoal[];
}

export async function getDespesaPessoalById(id: string): Promise<DespesaPessoal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("despesas_pessoal")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as DespesaPessoal | null;
}

export async function createDespesaPessoal(input: DespesaPessoalInput): Promise<DespesaPessoal> {
  const supabase = await createClient();
  const pago_em = input.status === "pago" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("despesas_pessoal")
    .insert({ ...input, pago_em })
    .select()
    .single();

  if (error) throw error;
  return data as DespesaPessoal;
}

export async function updateDespesaPessoal(
  id: string,
  input: DespesaPessoalInput,
): Promise<DespesaPessoal> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { ...input };

  if (input.status === "pago") {
    const { data: current } = await supabase
      .from("despesas_pessoal")
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
    .from("despesas_pessoal")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DespesaPessoal;
}

export async function deleteDespesaPessoal(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("despesas_pessoal").delete().eq("id", id);
  if (error) throw error;
}

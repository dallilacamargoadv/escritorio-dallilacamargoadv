import { createClient } from "@/lib/supabase/server";

export type FinanceiroPessoalStatus = "pendente" | "pago" | "cancelado";

export interface LancamentoPessoal {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: FinanceiroPessoalStatus;
  pago_em: string | null;
  created_at: string;
}

export interface LancamentoPessoalInput {
  descricao: string;
  valor: number;
  vencimento: string;
  status: FinanceiroPessoalStatus;
}

export async function getAllLancamentosPessoal(): Promise<LancamentoPessoal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("financeiro_pessoal_lancamentos")
    .select("*")
    .order("vencimento", { ascending: true });

  if (error) throw error;
  return data as LancamentoPessoal[];
}

export async function getLancamentoPessoalById(id: string): Promise<LancamentoPessoal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("financeiro_pessoal_lancamentos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as LancamentoPessoal | null;
}

export async function createLancamentoPessoal(
  input: LancamentoPessoalInput,
): Promise<LancamentoPessoal> {
  const supabase = await createClient();
  const pago_em = input.status === "pago" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("financeiro_pessoal_lancamentos")
    .insert({ ...input, pago_em })
    .select()
    .single();

  if (error) throw error;
  return data as LancamentoPessoal;
}

export async function updateLancamentoPessoal(
  id: string,
  input: LancamentoPessoalInput,
): Promise<LancamentoPessoal> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { ...input };

  if (input.status === "pago") {
    const { data: current } = await supabase
      .from("financeiro_pessoal_lancamentos")
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
    .from("financeiro_pessoal_lancamentos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as LancamentoPessoal;
}

export async function deleteLancamentoPessoal(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("financeiro_pessoal_lancamentos").delete().eq("id", id);
  if (error) throw error;
}

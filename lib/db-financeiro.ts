import { createClient } from "@/lib/supabase/server";

export type FinanceiroStatus = "pendente" | "pago";

export interface Lancamento {
  id: string;
  contrato_id: string;
  cliente_id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: FinanceiroStatus;
  pago_em: string | null;
  grupo_id: string | null;
}

export interface LancamentoInput {
  contrato_id: string;
  cliente_id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  grupo_id?: string | null;
}

export async function getAllLancamentos(
  clienteId?: string,
  contratoId?: string,
): Promise<Lancamento[]> {
  const supabase = await createClient();
  let query = supabase
    .from("financeiro_lancamentos")
    .select("*")
    .order("vencimento", { ascending: true });

  if (clienteId) {
    query = query.eq("cliente_id", clienteId);
  }
  if (contratoId) {
    query = query.eq("contrato_id", contratoId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Lancamento[];
}

export async function getLancamentoById(id: string): Promise<Lancamento | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Lancamento | null;
}

export async function createLancamento(input: LancamentoInput): Promise<Lancamento> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .insert({
      contrato_id: input.contrato_id,
      cliente_id: input.cliente_id,
      descricao: input.descricao,
      valor: input.valor,
      vencimento: input.vencimento,
      grupo_id: input.grupo_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Lancamento;
}

export async function createLancamentosLote(
  inputs: LancamentoInput[],
): Promise<Lancamento[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .insert(
      inputs.map((input) => ({
        contrato_id: input.contrato_id,
        cliente_id: input.cliente_id,
        descricao: input.descricao,
        valor: input.valor,
        vencimento: input.vencimento,
        grupo_id: input.grupo_id ?? null,
      })),
    )
    .select();

  if (error) throw error;
  return data as Lancamento[];
}

export async function marcarComoPago(id: string): Promise<Lancamento> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .update({ status: "pago", pago_em: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Lancamento;
}

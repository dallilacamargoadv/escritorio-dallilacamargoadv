import { createClient } from "@/lib/supabase/server";

export type ContratoTipo = "projeto" | "recorrente";
export type ContratoStatus =
  | "rascunho"
  | "enviado"
  | "assinado"
  | "encerrado"
  | "cancelado";

export interface Contrato {
  id: string;
  cliente_id: string;
  tipo: ContratoTipo;
  status: ContratoStatus;
  valor: number | null;
  periodicidade: string | null;
  assinado_em: string | null;
  created_at: string;
}

export interface ContratoInput {
  cliente_id: string;
  tipo: ContratoTipo;
  status: ContratoStatus;
  valor: number | null;
  periodicidade: string | null;
}

export async function getAllContratos(clienteId?: string): Promise<Contrato[]> {
  const supabase = await createClient();
  let query = supabase
    .from("contratos")
    .select("*")
    .order("created_at", { ascending: false });

  if (clienteId) {
    query = query.eq("cliente_id", clienteId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Contrato[];
}

export async function getContratoById(id: string): Promise<Contrato | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contratos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Contrato | null;
}

export async function createContrato(input: ContratoInput): Promise<Contrato> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contratos")
    .insert({
      cliente_id: input.cliente_id,
      tipo: input.tipo,
      status: input.status,
      valor: input.valor,
      periodicidade: input.periodicidade,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Contrato;
}

export async function updateContrato(
  id: string,
  input: ContratoInput,
): Promise<Contrato> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    cliente_id: input.cliente_id,
    tipo: input.tipo,
    status: input.status,
    valor: input.valor,
    periodicidade: input.periodicidade,
  };

  if (input.status === "assinado") {
    const { data: current } = await supabase
      .from("contratos")
      .select("assinado_em")
      .eq("id", id)
      .single();
    if (!current?.assinado_em) {
      updates.assinado_em = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("contratos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Contrato;
}

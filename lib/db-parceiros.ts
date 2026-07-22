import { createClient } from "@/lib/supabase/server";
import type { TipoPessoa } from "@/lib/db-clientes";

export interface Parceiro {
  id: string;
  nome: string;
  tipo_pessoa: TipoPessoa;
  contato: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface ParceiroInput {
  nome: string;
  tipo_pessoa: TipoPessoa;
  contato: string | null;
  observacoes: string | null;
}

export async function getAllParceiros(): Promise<Parceiro[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parceiros")
    .select("*")
    .order("nome", { ascending: true });

  if (error) throw error;
  return data as Parceiro[];
}

export async function getParceiroById(id: string): Promise<Parceiro | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parceiros")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Parceiro | null;
}

export async function createParceiro(input: ParceiroInput): Promise<Parceiro> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parceiros")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Parceiro;
}

export async function updateParceiro(
  id: string,
  input: ParceiroInput,
): Promise<Parceiro> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parceiros")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Parceiro;
}

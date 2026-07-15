import { createClient } from "@/lib/supabase/server";
import { updateLeadStatus } from "@/lib/db-admin";
import type { LeadFormType } from "@/lib/db-leads";

export type TipoPessoa = "pf" | "pj";

export interface Cliente {
  id: string;
  lead_id: string | null;
  tipo_pessoa: TipoPessoa;
  nome_razao_social: string;
  documento: string | null;
  email: string;
  whatsapp: string | null;
  endereco: { completo?: string };
  area_origem: LeadFormType | null;
  created_at: string;
}

export interface ClienteInput {
  tipo_pessoa: TipoPessoa;
  nome_razao_social: string;
  documento: string;
  email: string;
  whatsapp: string;
  endereco: { completo?: string };
  area_origem: LeadFormType | null;
}

export async function getAllClientes(): Promise<Cliente[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Cliente[];
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Cliente | null;
}

export async function createCliente(input: ClienteInput): Promise<Cliente> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      tipo_pessoa: input.tipo_pessoa,
      nome_razao_social: input.nome_razao_social,
      documento: input.documento,
      email: input.email,
      whatsapp: input.whatsapp,
      endereco: input.endereco,
      area_origem: input.area_origem,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Cliente;
}

export async function updateCliente(
  id: string,
  input: ClienteInput,
): Promise<Cliente> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .update({
      tipo_pessoa: input.tipo_pessoa,
      nome_razao_social: input.nome_razao_social,
      documento: input.documento,
      email: input.email,
      whatsapp: input.whatsapp,
      endereco: input.endereco,
      area_origem: input.area_origem,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Cliente;
}

export async function convertLeadToCliente(
  leadId: string,
  input: ClienteInput,
): Promise<Cliente> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      lead_id: leadId,
      tipo_pessoa: input.tipo_pessoa,
      nome_razao_social: input.nome_razao_social,
      documento: input.documento,
      email: input.email,
      whatsapp: input.whatsapp,
      endereco: input.endereco,
      area_origem: input.area_origem,
    })
    .select()
    .single();

  if (error) throw error;

  await updateLeadStatus(leadId, "cliente");

  return data as Cliente;
}

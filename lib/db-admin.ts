import { createClient } from "@/lib/supabase/server";
import { addBusinessDays } from "@/lib/business-days";
import type { LeadFormType } from "@/lib/db-leads";

export type LeadStatus =
  | "leads"
  | "contactados"
  | "em_andamento"
  | "proposta_enviada"
  | "link_enviado"
  | "f1_01_dia"
  | "f2_02_dias"
  | "f3_03_dias"
  | "f4_05_dias"
  | "f5_07_dias"
  | "f6_10_dias"
  | "f7_12_dias"
  | "f8_15_dias"
  | "grupo_criado"
  | "reuniao_agendada"
  | "salesfarming"
  | "perdido"
  | "cliente";

export interface Lead {
  id: string;
  created_at: string;
  form_type: LeadFormType;
  scope_key: string;
  name: string;
  email: string;
  whatsapp: string;
  answers: Record<string, unknown>;
  utms: Record<string, string>;
  metadata: Record<string, unknown>;
  duplicate_of: string | null;
  status: LeadStatus;
  sla_due_at: string | null;
  first_contacted_at: string | null;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string | null;
  body: string;
  next_action_at: string | null;
  created_at: string;
}

export async function getAllLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Lead[];
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
): Promise<void> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (status !== "leads") {
    const { data: current } = await supabase
      .from("leads")
      .select("first_contacted_at")
      .eq("id", leadId)
      .single();
    if (!current?.first_contacted_at) {
      updates.first_contacted_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", leadId);

  if (error) throw error;
}

export interface CreateLeadManualInput {
  formType: LeadFormType;
  name: string;
  email: string;
  whatsapp: string;
}

export async function createLeadManual(
  input: CreateLeadManualInput,
): Promise<Lead> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      form_type: input.formType,
      scope_key: "manual",
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      whatsapp: input.whatsapp.replace(/\D/g, ""),
      answers: {},
      utms: {},
      metadata: { origem: "cadastro_manual" },
      sla_due_at: addBusinessDays(new Date(), 2).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Lead | null;
}

export async function getNewLeadsCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "leads");

  if (error) throw error;
  return count ?? 0;
}

export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as LeadNote[];
}

export async function addLeadNote(
  leadId: string,
  body: string,
): Promise<LeadNote> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("lead_notes")
    .insert({ lead_id: leadId, body, author_id: user?.id ?? null })
    .select()
    .single();

  if (error) throw error;
  return data as LeadNote;
}

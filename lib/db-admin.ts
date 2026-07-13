import { createClient } from "@/lib/supabase/server";
import type { LeadFormType } from "@/lib/db-leads";

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

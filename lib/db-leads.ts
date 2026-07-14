import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type LeadFormType =
  | "contratos"
  | "propriedade_intelectual"
  | "contas_e_plataformas"
  | "golpes_virtuais"
  | "assessoria_estrategica";

export interface InsertLeadInput {
  formType: LeadFormType;
  scopeKey?: string;
  name: string;
  email: string;
  whatsapp: string;
  answers: Record<string, unknown>;
  utms: Record<string, string>;
  metadata: Record<string, unknown>;
}

export type InsertLeadResult =
  | { duplicate: true }
  | { duplicate: false };

const UNIQUE_VIOLATION = "23505";

function getAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function insertLead(
  input: InsertLeadInput,
): Promise<InsertLeadResult> {
  const supabase = getAnonClient();

  const { error } = await supabase.from("leads").insert({
    form_type: input.formType,
    scope_key: input.scopeKey ?? "global",
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    whatsapp: input.whatsapp.replace(/\D/g, ""),
    answers: input.answers,
    utms: input.utms,
    metadata: input.metadata,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { duplicate: true };
    }
    throw error;
  }

  return { duplicate: false };
}

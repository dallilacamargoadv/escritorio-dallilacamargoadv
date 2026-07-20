import { createClient } from "@/lib/supabase/server";
import type { LeadFormType } from "@/lib/db-leads";
import type { FrenteTipo } from "@/lib/db-frentes";

export interface FluxoEtapaTemplate {
  id: string;
  template_id: string;
  nome: string;
  ordem: number;
  checklist: string[];
  sla_dias: number | null;
  minuta_url: string | null;
}

export interface FluxoTemplate {
  id: string;
  area: LeadFormType;
  tipo_frente: FrenteTipo;
  created_at: string;
}

export interface FluxoTemplateComEtapas extends FluxoTemplate {
  etapas: FluxoEtapaTemplate[];
}

export async function getAllFluxoTemplates(): Promise<FluxoTemplateComEtapas[]> {
  const supabase = await createClient();
  const [{ data: templates, error: templatesError }, { data: etapas, error: etapasError }] =
    await Promise.all([
      supabase.from("fluxo_templates").select("*").order("area"),
      supabase.from("fluxo_etapas_template").select("*").order("ordem"),
    ]);

  if (templatesError) throw templatesError;
  if (etapasError) throw etapasError;

  return (templates as FluxoTemplate[]).map((template) => ({
    ...template,
    etapas: (etapas as FluxoEtapaTemplate[]).filter((e) => e.template_id === template.id),
  }));
}

export async function getFluxoTemplateFor(
  area: LeadFormType,
  tipoFrente: FrenteTipo,
): Promise<FluxoTemplateComEtapas | null> {
  const supabase = await createClient();
  const { data: template, error: templateError } = await supabase
    .from("fluxo_templates")
    .select("*")
    .eq("area", area)
    .eq("tipo_frente", tipoFrente)
    .maybeSingle();

  if (templateError) throw templateError;
  if (!template) return null;

  const { data: etapas, error: etapasError } = await supabase
    .from("fluxo_etapas_template")
    .select("*")
    .eq("template_id", template.id)
    .order("ordem");

  if (etapasError) throw etapasError;

  return { ...(template as FluxoTemplate), etapas: etapas as FluxoEtapaTemplate[] };
}

export async function createFluxoTemplate(
  area: LeadFormType,
  tipoFrente: FrenteTipo,
): Promise<FluxoTemplate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fluxo_templates")
    .insert({ area, tipo_frente: tipoFrente })
    .select()
    .single();

  if (error) throw error;
  return data as FluxoTemplate;
}

export async function deleteFluxoTemplate(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("fluxo_templates").delete().eq("id", id);
  if (error) throw error;
}

export async function createFluxoEtapaTemplate(
  templateId: string,
  nome: string,
  ordem: number,
  checklist: string[],
  slaDias: number | null,
  minutaUrl: string | null,
): Promise<FluxoEtapaTemplate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fluxo_etapas_template")
    .insert({
      template_id: templateId,
      nome,
      ordem,
      checklist,
      sla_dias: slaDias,
      minuta_url: minutaUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data as FluxoEtapaTemplate;
}

export async function updateFluxoEtapaTemplate(
  id: string,
  nome: string,
  checklist: string[],
  slaDias: number | null,
  minutaUrl: string | null,
): Promise<FluxoEtapaTemplate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fluxo_etapas_template")
    .update({ nome, checklist, sla_dias: slaDias, minuta_url: minutaUrl })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as FluxoEtapaTemplate;
}

export async function deleteFluxoEtapaTemplate(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("fluxo_etapas_template").delete().eq("id", id);
  if (error) throw error;
}

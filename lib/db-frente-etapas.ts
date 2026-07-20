import { createClient } from "@/lib/supabase/server";
import { getFluxoTemplateFor } from "@/lib/db-fluxo-templates";
import { createHistoricoEntry } from "@/lib/db-caso-historico";
import type { LeadFormType } from "@/lib/db-leads";
import type { FrenteTipo } from "@/lib/db-frentes";

export type FrenteEtapaStatus = "pendente" | "concluida";

export interface FrenteEtapa {
  id: string;
  caso_frente_id: string;
  nome: string;
  ordem: number;
  status: FrenteEtapaStatus;
  concluida_em: string | null;
  checklist_texto: string[];
  checklist_marcados: number[];
  documento_id: string | null;
  created_at: string;
  sla_dias: number | null;
  minuta_url: string | null;
  tempo_total_segundos: number;
  timer_iniciado_em: string | null;
}

export async function getEtapasByFrente(frenteId: string): Promise<FrenteEtapa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("frente_etapas")
    .select("*")
    .eq("caso_frente_id", frenteId)
    .order("ordem");

  if (error) throw error;
  return data as FrenteEtapa[];
}

/** Copia as etapas do modelo (se existir um pra essa área+tipo) pra frente recém-criada. */
export async function copiarEtapasDoTemplate(
  frenteId: string,
  area: LeadFormType,
  tipoFrente: FrenteTipo,
): Promise<void> {
  const template = await getFluxoTemplateFor(area, tipoFrente);
  if (!template || template.etapas.length === 0) return;

  const supabase = await createClient();
  const { error } = await supabase.from("frente_etapas").insert(
    template.etapas.map((etapa) => ({
      caso_frente_id: frenteId,
      nome: etapa.nome,
      ordem: etapa.ordem,
      checklist_texto: etapa.checklist,
      sla_dias: etapa.sla_dias,
      minuta_url: etapa.minuta_url,
    })),
  );

  if (error) throw error;
}

export async function createFrenteEtapa(
  frenteId: string,
  nome: string,
  ordem: number,
): Promise<FrenteEtapa> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("frente_etapas")
    .insert({ caso_frente_id: frenteId, nome, ordem })
    .select()
    .single();

  if (error) throw error;
  return data as FrenteEtapa;
}

export async function deleteFrenteEtapa(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("frente_etapas").delete().eq("id", id);
  if (error) throw error;
}

/** Marca/desmarca a etapa concluída; ao concluir, gera uma entrada na linha do tempo sozinha. */
export async function setFrenteEtapaStatus(
  id: string,
  casoId: string,
  status: FrenteEtapaStatus,
): Promise<FrenteEtapa> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (status === "concluida") updates.concluida_em = new Date().toISOString();

  const { data, error } = await supabase
    .from("frente_etapas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  if (status === "concluida") {
    await createHistoricoEntry(casoId, `Etapa concluída: ${data.nome}`, null);
  }

  return data as FrenteEtapa;
}

export async function setFrenteEtapaChecklist(
  id: string,
  checklistMarcados: number[],
): Promise<FrenteEtapa> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("frente_etapas")
    .update({ checklist_marcados: checklistMarcados })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as FrenteEtapa;
}

/** Liga o cronômetro da etapa — não pode ligar se já estiver rodando. */
export async function iniciarTimerEtapa(id: string): Promise<FrenteEtapa> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("frente_etapas")
    .update({ timer_iniciado_em: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as FrenteEtapa;
}

/** Pausa o cronômetro, somando o tempo decorrido ao total acumulado. */
export async function pausarTimerEtapa(id: string): Promise<FrenteEtapa> {
  const supabase = await createClient();
  const { data: atual, error: fetchError } = await supabase
    .from("frente_etapas")
    .select("tempo_total_segundos, timer_iniciado_em")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;
  if (!atual.timer_iniciado_em) {
    throw new Error("Cronômetro não está rodando");
  }

  const decorridoSegundos = Math.round(
    (Date.now() - new Date(atual.timer_iniciado_em).getTime()) / 1000,
  );

  const { data, error } = await supabase
    .from("frente_etapas")
    .update({
      tempo_total_segundos: atual.tempo_total_segundos + decorridoSegundos,
      timer_iniciado_em: null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as FrenteEtapa;
}

export async function setFrenteEtapaDocumento(
  id: string,
  documentoId: string | null,
): Promise<FrenteEtapa> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("frente_etapas")
    .update({ documento_id: documentoId })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as FrenteEtapa;
}

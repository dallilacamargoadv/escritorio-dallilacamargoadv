import questoesJson from "@/content/estudos/questoes.json";
import type { Classificacao, Questao, Resposta } from "@/lib/estudos-desempenho";
import { createClient } from "@/lib/supabase/server";
import {
  CONFIG_PADRAO,
  normalizarConfig,
  TOPICO_POR_ID,
  type CronogramaItem,
  type EstudoConfig,
  type NovoItem,
  type TopicoEstado,
  type TopicoStatus,
} from "@/lib/estudos-utils";

export async function getEstudoConfig(): Promise<EstudoConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_config").select("valor").eq("chave", "geral").maybeSingle();
  if (error) throw error;
  return data ? normalizarConfig(data.valor) : CONFIG_PADRAO;
}

export async function saveEstudoConfig(config: EstudoConfig): Promise<EstudoConfig> {
  const supabase = await createClient();
  const valor = normalizarConfig(config);
  const { error } = await supabase
    .from("estudo_config")
    .upsert({ chave: "geral", valor, updated_at: new Date().toISOString() });
  if (error) throw error;
  return valor;
}

export async function getTopicoEstados(): Promise<Map<string, TopicoEstado>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_topicos").select("topico_id,status,fora_do_edital,nota");
  if (error) throw error;
  return new Map((data ?? []).map((e) => [e.topico_id, e as TopicoEstado]));
}

export async function updateTopicoEstado(
  topicoId: string,
  patch: { status?: TopicoStatus; fora_do_edital?: boolean; nota?: string | null },
): Promise<TopicoEstado> {
  if (!TOPICO_POR_ID.has(topicoId)) throw new Error("tópico inexistente");
  const supabase = await createClient();
  const { data: atual } = await supabase.from("estudo_topicos").select("*").eq("topico_id", topicoId).maybeSingle();
  const linha = {
    topico_id: topicoId,
    status: patch.status ?? atual?.status ?? "nao_iniciado",
    fora_do_edital: patch.fora_do_edital ?? atual?.fora_do_edital ?? false,
    nota: "nota" in patch ? patch.nota ?? null : atual?.nota ?? null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("estudo_topicos").upsert(linha).select("topico_id,status,fora_do_edital,nota").single();
  if (error) throw error;
  return data as TopicoEstado;
}

export async function getCronograma(de: string, ate: string): Promise<CronogramaItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estudo_cronograma")
    .select("*")
    .gte("data", de)
    .lte("data", ate)
    .order("data", { ascending: true })
    .order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CronogramaItem[];
}

export async function getAtrasados(hoje: string): Promise<CronogramaItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estudo_cronograma")
    .select("*")
    .lt("data", hoje)
    .eq("feito", false)
    .order("data", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CronogramaItem[];
}

export async function getDiasComBlocoFeito(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_cronograma").select("data").eq("feito", true);
  if (error) throw error;
  return [...new Set((data ?? []).map((d) => d.data as string))];
}

export async function getUltimoDiaTeoria(): Promise<{ data: string; tipo: string; materia_id: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estudo_cronograma")
    .select("data,tipo,materia_id")
    .eq("tipo", "teoria")
    .order("data", { ascending: false })
    .limit(50);
  if (error) throw error;
  return ((data ?? []) as { data: string; tipo: string; materia_id: string }[]).reverse();
}

/**
 * Refaz o plano a partir de hoje: apaga os blocos não feitos (de hoje em diante e os atrasados)
 * e grava os novos. Os blocos já feitos ficam como histórico.
 */
export async function substituirCronograma(itens: NovoItem[]): Promise<number> {
  const supabase = await createClient();
  const { error: delError } = await supabase.from("estudo_cronograma").delete().eq("feito", false);
  if (delError) throw delError;
  for (let i = 0; i < itens.length; i += 500) {
    const { error } = await supabase.from("estudo_cronograma").insert(itens.slice(i, i + 500));
    if (error) throw error;
  }
  return itens.length;
}

export async function marcarItem(id: string, feito: boolean): Promise<CronogramaItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estudo_cronograma")
    .update({ feito, feito_em: feito ? new Date().toISOString() : null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CronogramaItem;
}

/* ===================== QUESTÕES, RESPOSTAS E CALENDÁRIO DO CONCURSO ===================== */

/** Banco de questões (fica só no servidor: o arquivo é grande para mandar inteiro ao navegador). */
export const QUESTOES = questoesJson as Questao[];
export const QUESTAO_POR_ID = new Map(QUESTOES.map((q) => [q.id, q]));

export async function getRespostas(): Promise<Resposta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estudo_respostas")
    .select("*")
    .order("respondida_em", { ascending: true })
    .limit(20000);
  if (error) throw error;
  return (data ?? []) as Resposta[];
}

export async function createResposta(r: {
  questao_id: string;
  correta: boolean;
  alternativa: number;
  classificacao: Classificacao;
  tempo_seg: number | null;
  contexto: "treino" | "revisao" | "simulado";
  nota: string | null;
}): Promise<Resposta> {
  const q = QUESTAO_POR_ID.get(r.questao_id);
  if (!q) throw new Error("questão inexistente");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estudo_respostas")
    .insert({ ...r, correta: r.alternativa === q.c, materia_id: q.materia_id, tema: q.tema })
    .select()
    .single();
  if (error) throw error;
  return data as Resposta;
}

export interface EventoConcurso {
  id: string;
  ordem: number;
  titulo: string;
  data: string | null;
  situacao: "sem_data" | "previsto" | "confirmado" | "realizado";
  fonte_url: string | null;
  nota: string | null;
}
export async function getEventos(): Promise<EventoConcurso[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_eventos").select("id,ordem,titulo,data,situacao,fonte_url,nota").order("ordem");
  if (error) throw error;
  return (data ?? []) as EventoConcurso[];
}
export async function updateEvento(id: string, patch: Partial<Omit<EventoConcurso, "id" | "ordem" | "titulo">>): Promise<EventoConcurso> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estudo_eventos")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id,ordem,titulo,data,situacao,fonte_url,nota")
    .single();
  if (error) throw error;
  return data as EventoConcurso;
}

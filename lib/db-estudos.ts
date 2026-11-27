import questoesJson from "@/content/estudos/questoes.json";
import { SUBTEMA_DA_QUESTAO } from "@/lib/estudos-subtemas";
import cartoesJson from "@/content/estudos/cartoes.json";
import { JURIS_POR_ID } from "@/lib/estudos-juris-flash";
import type { Classificacao, Questao, Resposta } from "@/lib/estudos-desempenho";
import { normalizarLabConfig, type LabConfig } from "@/lib/estudos-laboratorio";
import {
  ETAPA_FINAL,
  etapaDoCartao,
  INTERVALOS,
  msDaData,
  proximaEtapa, proximaEtapaQuase,
  type Cartao,
  type EstadoCartao,
  type EstadoRevisao,
} from "@/lib/estudos-revisao";
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
export const QUESTOES = (questoesJson as Questao[]).map((q) => (SUBTEMA_DA_QUESTAO[q.id] ? { ...q, subtema: SUBTEMA_DA_QUESTAO[q.id] } : q));
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

/* ===================== LABORATÓRIO DE ERROS ===================== */

export async function getLabConfig(): Promise<LabConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_config").select("valor").eq("chave", "laboratorio").maybeSingle();
  if (error) throw error;
  return normalizarLabConfig(data?.valor);
}

export async function saveLabConfig(config: unknown): Promise<LabConfig> {
  const supabase = await createClient();
  const valor = normalizarLabConfig(config);
  const { error } = await supabase
    .from("estudo_config")
    .upsert({ chave: "laboratorio", valor, updated_at: new Date().toISOString() });
  if (error) throw error;
  return valor;
}

/* ===================== REVISÃO ESPAÇADA E POMODORO ===================== */

/** Texto dos cartões (frente e verso) vindo da plataforma antiga. Fica só no servidor. */
export const CARTOES = cartoesJson as Cartao[];
export const CARTAO_POR_ID = new Map(CARTOES.map((c) => [c.id, c]));

export async function getEstadosCartoes(): Promise<Map<string, EstadoCartao>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_cartoes").select("cartao_id,estado");
  if (error) throw error;
  return new Map((data ?? []).map((c) => [c.cartao_id as string, (c.estado ?? {}) as EstadoCartao]));
}

/** quase: lembrou em parte; o cartão repete o mesmo intervalo, sem subir nem voltar ao começo. resp: o que ela escreveu antes de virar. */
export async function revisarCartao(id: string, ok: boolean, hoje: string, opcoes: { quase?: boolean; resp?: string } = {}): Promise<void> {
  // "erro:<questão>" é o cartão gerado de um erro dela (lib/estudos-erros-cartoes.ts)
  const doErro = id.startsWith("erro:") && QUESTAO_POR_ID.has(id.slice(5));
  // "jce-..." é um item de jurisprudência em certo ou errado (lib/estudos-juris-flash.ts)
  if (!CARTAO_POR_ID.has(id) && !doErro && !JURIS_POR_ID.has(id)) throw new Error("cartão inexistente");
  const supabase = await createClient();
  const { data: atual } = await supabase.from("estudo_cartoes").select("estado").eq("cartao_id", id).maybeSingle();
  const estado = (atual?.estado ?? {}) as EstadoCartao;
  const agora = Date.now();
  const etapaAtual = atual ? etapaDoCartao(estado) : -1;
  const prox = opcoes.quase ? proximaEtapaQuase(etapaAtual, hoje) : proximaEtapa(etapaAtual, ok, hoje);
  const hist = [...(estado.hist ?? []), opcoes.quase ? { t: agora, ok: true, quase: true } : { t: agora, ok }].slice(-50);
  const resp = opcoes.resp?.trim() ? { resp: opcoes.resp.trim().slice(0, 2000), respEm: agora } : {};
  const novo: EstadoCartao = { ...estado, ...resp, etapa: prox.etapa, due: msDaData(prox.vence_em), int: INTERVALOS[Math.min(prox.etapa, INTERVALOS.length - 1)], hist, last: agora, first: estado.first ?? agora };
  const { error } = await supabase.from("estudo_cartoes").upsert({ cartao_id: id, estado: novo, atualizado_em: new Date().toISOString() });
  if (error) throw error;
}

export async function getEstadosRevisao(): Promise<Map<string, EstadoRevisao>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_revisao").select("item_id,etapa,vence_em,atualizado_em");
  if (error) throw error;
  return new Map((data ?? []).map((e) => [e.item_id as string, e as EstadoRevisao]));
}

export async function revisarArtigo(itemId: string, etapaAtual: number, ok: boolean, hoje: string): Promise<void> {
  const ref = itemId.replace(/^art:/, "");
  if (!itemId.startsWith("art:") || !QUESTOES.some((q) => q.ref === ref)) throw new Error("artigo inexistente");
  const supabase = await createClient();
  const { data: atual } = await supabase.from("estudo_revisao").select("historico").eq("item_id", itemId).maybeSingle();
  const prox = proximaEtapa(Math.max(0, Math.min(etapaAtual, ETAPA_FINAL)), ok, hoje);
  const historico = [...((atual?.historico as unknown[]) ?? []), { t: new Date().toISOString(), ok }].slice(-50);
  const { error } = await supabase
    .from("estudo_revisao")
    .upsert({ item_id: itemId, etapa: prox.etapa, vence_em: prox.vence_em, historico, atualizado_em: new Date().toISOString() });
  if (error) throw error;
}

export interface Pomodoro {
  id: string;
  data: string;
  minutos_efetivos: number;
  pausas: number;
  atividade: string | null;
  criado_em: string;
}

export async function getPomodoros(desde: string): Promise<Pomodoro[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estudo_pomodoros")
    .select("id,data,minutos_efetivos,pausas,atividade,criado_em")
    .gte("data", desde)
    .order("criado_em", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Pomodoro[];
}

export async function createPomodoro(p: { data: string; minutos_efetivos: number; pausas: number; atividade?: string | null }): Promise<Pomodoro> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_pomodoros").insert(p).select("id,data,minutos_efetivos,pausas,atividade,criado_em").single();
  if (error) throw error;
  return data as Pomodoro;
}

// Simulados no Supabase (tabela estudo_simulados). Só servidor.
import { todayBelemDateString } from "@/lib/atividades-utils";
import { getRespostas, QUESTAO_POR_ID, QUESTOES } from "@/lib/db-estudos";
import { EH_ERRO, TIPOS_ACERTO, type Classificacao } from "@/lib/estudos-desempenho";
import {
  classificacaoPadrao,
  distribuicaoSimuladao,
  escolher,
  poolLeiSeca,
  SEG_POR_QUESTAO,
  ultimaVezPorQuestao,
  type ItemSimulado,
  type Simulado,
  type TipoSimulado,
} from "@/lib/estudos-simulados";
import { createClient } from "@/lib/supabase/server";

const ACERTOS = new Set<string>(TIPOS_ACERTO.map((a) => a.k));

export async function getSimulados(): Promise<Simulado[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_simulados").select("*").order("iniciado_em", { ascending: false }).limit(500);
  if (error) throw error;
  return (data ?? []) as Simulado[];
}

export async function getSimulado(id: string): Promise<Simulado | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_simulados").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Simulado) ?? null;
}

export async function criarSimulado(tipo: "lei_seca" | "simuladao", total: number, materiaId: string | null): Promise<Simulado> {
  const respostas = await getRespostas();
  const ultima = ultimaVezPorQuestao(respostas);
  let ids: string[];
  if (tipo === "lei_seca") {
    if (!materiaId) throw new Error("matéria obrigatória");
    ids = escolher(poolLeiSeca(QUESTOES, materiaId), total, ultima).map((q) => q.id);
  } else {
    ids = distribuicaoSimuladao(QUESTOES, total).flatMap((d) =>
      escolher(QUESTOES.filter((q) => q.materia_id === d.materia_id), d.n, ultima).map((q) => q.id),
    );
  }
  if (!ids.length) throw new Error("sem questões");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estudo_simulados")
    .insert({
      origem: "site",
      tipo,
      materia_id: tipo === "lei_seca" ? materiaId : null,
      data: todayBelemDateString(),
      questoes: ids,
      total: ids.length,
      limite_seg: ids.length * SEG_POR_QUESTAO,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Simulado;
}

/** Corrige no servidor, grava uma resposta por questão (contexto "simulado", que já alimenta a Revisão) e fecha o simulado. */
export async function entregarSimulado(
  id: string,
  marcadas: { questao_id: string; alternativa: number | null; tempo_seg: number }[],
  duracaoSeg: number,
): Promise<Simulado> {
  const sim = await getSimulado(id);
  if (!sim || sim.origem !== "site") throw new Error("simulado inexistente");
  if (sim.status === "entregue") return sim;
  const porId = new Map(marcadas.map((m) => [m.questao_id, m]));
  const linhas = sim.questoes.map((qid) => {
    const q = QUESTAO_POR_ID.get(qid)!;
    const m = porId.get(qid);
    const alternativa = m && Number.isInteger(m.alternativa) && m.alternativa! >= 0 && m.alternativa! <= 4 ? m.alternativa : null;
    const tempo = m ? Math.max(0, Math.min(7200, Math.round(Number(m.tempo_seg) || 0))) : 0;
    const correta = alternativa === q.c;
    return { q, alternativa, tempo, correta, classificacao: classificacaoPadrao(correta, alternativa) };
  });
  const supabase = await createClient();
  const { data: inseridas, error: e1 } = await supabase
    .from("estudo_respostas")
    .insert(
      linhas.map((l) => ({
        questao_id: l.q.id,
        materia_id: l.q.materia_id,
        tema: l.q.tema,
        correta: l.correta,
        alternativa: l.alternativa,
        classificacao: l.classificacao,
        tempo_seg: l.tempo,
        contexto: "simulado",
        nota: null,
      })),
    )
    .select("id,questao_id");
  if (e1) throw e1;
  const respId = new Map((inseridas ?? []).map((r) => [r.questao_id as string, r.id as string]));
  const itens: ItemSimulado[] = linhas.map((l) => ({
    questao_id: l.q.id,
    alternativa: l.alternativa,
    tempo_seg: l.tempo,
    correta: l.correta,
    classificacao: l.classificacao,
    resposta_id: respId.get(l.q.id) ?? null,
  }));
  const { data, error } = await supabase
    .from("estudo_simulados")
    .update({
      status: "entregue",
      itens,
      acertos: itens.filter((i) => i.correta).length,
      duracao_seg: Math.max(0, Math.round(duracaoSeg)),
      entregue_em: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "em_andamento")
    .select()
    .single();
  if (error) throw error;
  return data as Simulado;
}

/** Troca o motivo do erro ou do acerto de uma questão do relatório (e na resposta gravada). */
export async function classificarItem(id: string, questaoId: string, classificacao: string): Promise<void> {
  const sim = await getSimulado(id);
  const item = sim?.itens.find((i) => i.questao_id === questaoId);
  if (!sim || !item) throw new Error("item inexistente");
  if (item.correta ? !ACERTOS.has(classificacao) : !EH_ERRO.has(classificacao)) throw new Error("classificação inválida");
  const supabase = await createClient();
  if (item.resposta_id) {
    const { error } = await supabase.from("estudo_respostas").update({ classificacao }).eq("id", item.resposta_id);
    if (error) throw error;
  }
  const itens = sim.itens.map((i) => (i.questao_id === questaoId ? { ...i, classificacao: classificacao as Classificacao } : i));
  const { error } = await supabase.from("estudo_simulados").update({ itens }).eq("id", id);
  if (error) throw error;
}

export async function registrarExterno(r: {
  tipo: TipoSimulado;
  materia_id: string | null;
  data: string;
  total: number;
  acertos: number;
  duracao_seg: number | null;
  fonte: string;
  nota: string | null;
}): Promise<Simulado> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estudo_simulados")
    .insert({ ...r, origem: "externo", status: "entregue", entregue_em: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as Simulado;
}

/** Só apaga simulado em andamento (descartar) ou registro feito fora. Entregue no site fica, porque as respostas já foram gravadas. */
export async function apagarSimulado(id: string): Promise<void> {
  const sim = await getSimulado(id);
  if (!sim) return;
  if (sim.origem === "site" && sim.status === "entregue") throw new Error("simulado entregue não se apaga");
  const supabase = await createClient();
  const { error } = await supabase.from("estudo_simulados").delete().eq("id", id);
  if (error) throw error;
}

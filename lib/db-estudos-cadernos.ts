import { createClient } from "@/lib/supabase/server";
import { updateTopicoEstado, getTopicoEstados } from "@/lib/db-estudos";
import type { Caderno, Secao } from "@/lib/estudos-cadernos";
import cadernoA2 from "@/content/estudos/cadernos/A2.json";
import cadernoA3 from "@/content/estudos/cadernos/A3.json";
import cadernoA4 from "@/content/estudos/cadernos/A4.json";
import cadernoA5 from "@/content/estudos/cadernos/A5.json";
import cadernoA6 from "@/content/estudos/cadernos/A6.json";
import cadernoB2 from "@/content/estudos/cadernos/B2.json";
import cadernoB3 from "@/content/estudos/cadernos/B3.json";
import cadernoB5 from "@/content/estudos/cadernos/B5.json";
import cadernoB6 from "@/content/estudos/cadernos/B6.json";
import cadernoB7 from "@/content/estudos/cadernos/B7.json";
import roteiros from "@/content/estudos/cadernos/roteiros-resolucao.json";

/** Cadernos prontos, por matéria. Novo caderno = novo JSON importado aqui. */
export const CADERNOS: Record<string, Caderno> = {
  A2: cadernoA2 as Caderno,
  A3: cadernoA3 as Caderno,
  A4: cadernoA4 as Caderno,
  A5: cadernoA5 as Caderno,
  A6: cadernoA6 as Caderno,
  B2: cadernoB2 as Caderno,
  B3: cadernoB3 as Caderno,
  B5: cadernoB5 as Caderno,
  B6: cadernoB6 as Caderno,
  B7: cadernoB7 as Caderno,
};

/** Seção "Na prova: como reconhecer e resolver" (Matemática e Informática), guardada à parte e somada ao fim da aula. */
const ROTEIROS = roteiros as unknown as Record<string, Secao | Secao[]>;
for (const c of Object.values(CADERNOS)) {
  c.aulas = c.aulas.map((a) => {
    const r = ROTEIROS[a.id];
    if (!r) return a;
    const secoes = a.secoes ?? [];
    const novas = (Array.isArray(r) ? r : [r]).filter((x) => !secoes.some((s) => s.titulo === x.titulo));
    return novas.length ? { ...a, secoes: [...secoes, ...novas] } : a;
  });
}
export const AULA_POR_ID = new Map(
  Object.values(CADERNOS).flatMap((c) => c.aulas.map((a) => [a.id, { aula: a, caderno: c }] as const)),
);

export async function getAulasEstudadas(): Promise<Map<string, string | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_aulas").select("aula_id,estudada,estudada_em").eq("estudada", true);
  if (error) throw error;
  return new Map((data ?? []).map((a) => [a.aula_id as string, a.estudada_em as string | null]));
}

/** Marca a aula; ao marcar como estudada, o tópico do edital passa pelo menos para "estudando". */
export async function marcarAula(aulaId: string, estudada: boolean) {
  const ref = AULA_POR_ID.get(aulaId);
  if (!ref) throw new Error("aula inexistente");
  const supabase = await createClient();
  const { error } = await supabase
    .from("estudo_aulas")
    .upsert({ aula_id: aulaId, estudada, estudada_em: estudada ? new Date().toISOString() : null, updated_at: new Date().toISOString() });
  if (error) throw error;
  if (estudada) {
    const estados = await getTopicoEstados();
    const atual = estados.get(ref.aula.topico_id)?.status ?? "nao_iniciado";
    if (atual === "nao_iniciado") await updateTopicoEstado(ref.aula.topico_id, { status: "estudando" });
  }
}

export interface RegistroTec {
  id: string;
  tipo: "resolucao" | "incidencia";
  materia_id: string;
  assunto: string;
  questoes: number;
  acertos: number | null;
  banca: string;
  fonte: string;
  referencia: string;
  nota: string | null;
}
export async function getRegistrosTec(): Promise<RegistroTec[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_tec").select("id,tipo,materia_id,assunto,questoes,acertos,banca,fonte,referencia,nota").order("referencia", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RegistroTec[];
}
export async function criarRegistrosTec(linhas: Omit<RegistroTec, "id">[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("estudo_tec").insert(linhas);
  if (error) throw error;
}
export async function apagarRegistroTec(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("estudo_tec").delete().eq("id", id);
  if (error) throw error;
}

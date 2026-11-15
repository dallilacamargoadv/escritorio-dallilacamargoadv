import { createClient } from "@/lib/supabase/server";
import { updateTopicoEstado, getTopicoEstados } from "@/lib/db-estudos";
import type { Caderno } from "@/lib/estudos-cadernos";
import cadernoB2 from "@/content/estudos/cadernos/B2.json";

/** Cadernos prontos, por matéria. Novo caderno = novo JSON importado aqui. */
export const CADERNOS: Record<string, Caderno> = {
  B2: cadernoB2 as Caderno,
};
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

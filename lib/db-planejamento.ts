import { createClient } from "@/lib/supabase/server";

export interface MetaTrimestreKR {
  id: string;
  meta_trimestre_id: string;
  ordem: number;
  titulo: string;
  descricao: string | null;
  concluido: boolean;
  concluido_em: string | null;
  created_at: string;
}

export interface MetaTrimestre {
  id: string;
  periodo: string;
  objetivo: string;
  created_at: string;
  krs: MetaTrimestreKR[];
}

export async function getMetaTrimestreAtual(): Promise<MetaTrimestre | null> {
  const supabase = await createClient();
  const { data: metas, error } = await supabase
    .from("metas_trimestre")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!metas || metas.length === 0) return null;

  const meta = metas[0];
  const { data: krs, error: krsError } = await supabase
    .from("metas_trimestre_krs")
    .select("*")
    .eq("meta_trimestre_id", meta.id)
    .order("ordem", { ascending: true });

  if (krsError) throw krsError;

  return { ...meta, krs: (krs ?? []) as MetaTrimestreKR[] } as MetaTrimestre;
}

export async function setKRConcluido(
  id: string,
  concluido: boolean,
): Promise<MetaTrimestreKR> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("metas_trimestre_krs")
    .update({ concluido, concluido_em: concluido ? new Date().toISOString() : null })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as MetaTrimestreKR;
}

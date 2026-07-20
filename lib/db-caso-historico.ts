import { createClient } from "@/lib/supabase/server";

export interface CasoHistoricoEntry {
  id: string;
  caso_id: string;
  texto: string;
  autor: string;
  created_at: string;
  retifica_id: string | null;
}

/** Ordenado do mais antigo pro mais recente — a primeira entrada é a Anamnese. */
export async function getHistoricoByCaso(
  casoId: string,
): Promise<CasoHistoricoEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caso_historico")
    .select("*")
    .eq("caso_id", casoId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as CasoHistoricoEntry[];
}

export async function createHistoricoEntry(
  casoId: string,
  texto: string,
  retificaId: string | null,
): Promise<CasoHistoricoEntry> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caso_historico")
    .insert({ caso_id: casoId, texto, retifica_id: retificaId })
    .select()
    .single();

  if (error) throw error;
  return data as CasoHistoricoEntry;
}

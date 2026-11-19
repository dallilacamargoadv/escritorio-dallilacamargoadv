import { normalizarEstado, type EstadoVerbos } from "@/lib/estudos-verbos";
import { createClient } from "@/lib/supabase/server";

/** Progresso do treino de verbos em estudo_config, chave "verbos". */
export async function getEstadoVerbos(): Promise<EstadoVerbos> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_config").select("valor").eq("chave", "verbos").maybeSingle();
  if (error) throw error;
  return normalizarEstado(data?.valor);
}

export async function salvarEstadoVerbos(estado: unknown): Promise<void> {
  const supabase = await createClient();
  const valor = normalizarEstado(estado);
  const { error } = await supabase.from("estudo_config").upsert({ chave: "verbos", valor, updated_at: new Date().toISOString() });
  if (error) throw error;
}

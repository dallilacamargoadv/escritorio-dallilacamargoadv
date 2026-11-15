import desafiosJson from "@/content/estudos/desafios.json";
import { corrigir, normalizarEstado, type Correcao, type Desafio, type EstadoDesafios } from "@/lib/estudos-desafios";
import { createClient } from "@/lib/supabase/server";

/** Texto e gabarito ficam só no servidor. Estado em estudo_config, chave "desafios". */
export const DESAFIOS = desafiosJson as Desafio[];
export const DESAFIO_POR_ID = new Map(DESAFIOS.map((d) => [d.id, d]));

export async function getEstadoDesafios(): Promise<EstadoDesafios> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_config").select("valor").eq("chave", "desafios").maybeSingle();
  if (error) throw error;
  return normalizarEstado(data?.valor);
}

/** Corrige uma resposta e grava no dia (conta para a sequência). */
export async function responderDesafio(id: string, resposta: string, hoje: string): Promise<Correcao | null> {
  const d = DESAFIO_POR_ID.get(id);
  if (!d) return null;
  const c = corrigir(d, resposta);
  const estado = await getEstadoDesafios();
  const dia = estado.dias[hoje] ?? { acertos: 0, total: 0 };
  estado.dias[hoje] = { acertos: dia.acertos + (c.ok ? 1 : 0), total: dia.total + 1 };
  const v = estado.vistos[id];
  estado.vistos[id] = { ult: hoje, ok: c.ok, vezes: (v?.vezes ?? 0) + 1 };
  const supabase = await createClient();
  const { error } = await supabase
    .from("estudo_config")
    .upsert({ chave: "desafios", valor: estado, updated_at: new Date().toISOString() });
  if (error) throw error;
  return c;
}

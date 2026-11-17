import trilhasJson from "@/content/estudos/trilhas.json";
import { chaveDia, corrigirItem, normalizarTrilhas, type CorrecaoTrilha, type EstadoTrilhas, type ItemTrilha, type Trilha } from "@/lib/estudos-trilhas";
import { createClient } from "@/lib/supabase/server";

/** Texto e gabarito só no servidor. Estado em estudo_config, chave "trilhas". */
export const TRILHAS = trilhasJson as Trilha[];
export const TRILHA_POR_ID = new Map(TRILHAS.map((t) => [t.id, t]));
const ITEM_POR_ID = new Map<string, ItemTrilha>();
for (const t of TRILHAS) for (const d of t.dias) for (const i of d.itens) ITEM_POR_ID.set(i.id, i);

export async function getEstadoTrilhas(): Promise<EstadoTrilhas> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_config").select("valor").eq("chave", "trilhas").maybeSingle();
  if (error) throw error;
  return normalizarTrilhas(data?.valor);
}

async function salvar(estado: EstadoTrilhas) {
  const supabase = await createClient();
  const { error } = await supabase.from("estudo_config").upsert({ chave: "trilhas", valor: estado, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function responderItem(id: string, resposta: string): Promise<CorrecaoTrilha | null> {
  const item = ITEM_POR_ID.get(id);
  if (!item) return null;
  const c = corrigirItem(item, resposta);
  const estado = await getEstadoTrilhas();
  estado.resp[id] = c.ok;
  await salvar(estado);
  return c;
}

/** Fecha o dia da trilha: guarda acertos do bloco e o texto do blurting. */
export async function concluirDia(trilhaId: string, dia: number, blurt: string, hoje: string): Promise<boolean> {
  const t = TRILHA_POR_ID.get(trilhaId);
  const d = t?.dias.find((x) => x.dia === dia);
  if (!t || !d) return false;
  const estado = await getEstadoTrilhas();
  const respondidos = d.itens.filter((i) => i.id in estado.resp);
  estado.concluidos[chaveDia(t.id, dia)] = {
    data: hoje,
    acertos: respondidos.filter((i) => estado.resp[i.id]).length,
    total: respondidos.length,
    blurt: blurt.slice(0, 4000),
  };
  await salvar(estado);
  return true;
}

/** Desfaz a conclusão (para refazer o dia). */
export async function reabrirDia(trilhaId: string, dia: number): Promise<void> {
  const estado = await getEstadoTrilhas();
  delete estado.concluidos[chaveDia(trilhaId, dia)];
  const t = TRILHA_POR_ID.get(trilhaId);
  for (const i of t?.dias.find((x) => x.dia === dia)?.itens ?? []) delete estado.resp[i.id];
  await salvar(estado);
}

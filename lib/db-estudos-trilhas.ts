import trilhasJson from "@/content/estudos/trilhas.json";
import { corrigirItem, normalizarTrilhas, type CorrecaoTrilha, type EstadoTrilhas, type ItemTrilha, type TemaTrilha, type Trilha } from "@/lib/estudos-trilhas";
import { createClient } from "@/lib/supabase/server";

/** Texto e gabarito só no servidor. Estado em estudo_config, chave "trilhas". */
export const TRILHAS = trilhasJson as Trilha[];
export const TEMA_POR_ID = new Map<string, { trilha: Trilha; tema: TemaTrilha }>();
const ITEM_POR_ID = new Map<string, ItemTrilha>();
for (const t of TRILHAS)
  for (const x of t.temas) {
    TEMA_POR_ID.set(x.id, { trilha: t, tema: x });
    for (const i of x.itens) ITEM_POR_ID.set(i.id, i);
  }

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

/** Fecha o tema: guarda acertos do bloco e o texto do blurting. */
export async function concluirTema(temaId: string, blurt: string, hoje: string): Promise<boolean> {
  const x = TEMA_POR_ID.get(temaId)?.tema;
  if (!x) return false;
  const estado = await getEstadoTrilhas();
  const respondidos = x.itens.filter((i) => i.id in estado.resp);
  estado.concluidos[x.id] = {
    data: hoje,
    acertos: respondidos.filter((i) => estado.resp[i.id]).length,
    total: respondidos.length,
    blurt: blurt.slice(0, 4000),
  };
  await salvar(estado);
  return true;
}

/** Desfaz a conclusão (para refazer o tema). */
export async function reabrirTema(temaId: string): Promise<void> {
  const estado = await getEstadoTrilhas();
  delete estado.concluidos[temaId];
  for (const i of TEMA_POR_ID.get(temaId)?.tema.itens ?? []) delete estado.resp[i.id];
  await salvar(estado);
}

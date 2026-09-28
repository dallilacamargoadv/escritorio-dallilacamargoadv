import { createClient } from "@/lib/supabase/server";

export type EstrategiaCadencia =
  | "diaria"
  | "semanal"
  | "quinzenal"
  | "mensal"
  | "trimestral"
  | "semestral"
  | "anual"
  | "ao_final_do_caso"
  | "segundo_semestre";

export interface EstrategiaItem {
  id: string;
  area_id: string;
  cadencia: EstrategiaCadencia;
  titulo: string;
  indicador: string | null;
  ordem: number;
  concluido: boolean;
  concluido_em: string | null;
  atividade_id: string | null;
  created_at: string;
}

export interface EstrategiaArea {
  id: string;
  slug: string;
  nome: string;
  objetivo: string | null;
  ordem: number;
  itens: EstrategiaItem[];
}

export async function getEstrategiaAreas(): Promise<EstrategiaArea[]> {
  const supabase = await createClient();

  const { data: areas, error: areasError } = await supabase
    .from("estrategia_areas")
    .select("*")
    .order("ordem", { ascending: true });
  if (areasError) throw areasError;

  const { data: itens, error: itensError } = await supabase
    .from("estrategia_itens")
    .select("*")
    .order("ordem", { ascending: true });
  if (itensError) throw itensError;

  const itensPorArea = new Map<string, EstrategiaItem[]>();
  for (const item of (itens ?? []) as EstrategiaItem[]) {
    const lista = itensPorArea.get(item.area_id) ?? [];
    lista.push(item);
    itensPorArea.set(item.area_id, lista);
  }

  return (areas ?? []).map((area) => ({
    ...area,
    itens: itensPorArea.get(area.id) ?? [],
  })) as EstrategiaArea[];
}

/**
 * Marca (ou desmarca) um item da estratégia. Ao marcar, cria uma atividade
 * (tipo "compromisso", com a data de hoje) linkada — mesma lógica do
 * calendário editorial, pra aparecer em Atividades sem digitar duas vezes.
 */
export async function setItemConcluido(
  id: string,
  concluido: boolean,
): Promise<EstrategiaItem> {
  const supabase = await createClient();

  const { data: atual, error: fetchError } = await supabase
    .from("estrategia_itens")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  const item = atual as EstrategiaItem;

  let atividadeId = item.atividade_id;
  const hoje = new Date().toISOString().slice(0, 10);

  if (concluido && !atividadeId) {
    const { data: atividade, error: atividadeError } = await supabase
      .from("atividades")
      .insert({
        tipo: "compromisso",
        titulo: item.titulo,
        data: hoje,
        hora: null,
        caso_frente_id: null,
        caso_id: null,
        cliente_id: null,
        status: "concluido",
        visivel_cliente: false,
      })
      .select()
      .single();
    if (atividadeError) throw atividadeError;
    atividadeId = atividade.id as string;
  } else if (!concluido && atividadeId) {
    await supabase.from("atividades").update({ status: "cancelado" }).eq("id", atividadeId);
  } else if (concluido && atividadeId) {
    await supabase
      .from("atividades")
      .update({ status: "concluido", concluido_em: new Date().toISOString() })
      .eq("id", atividadeId);
  }

  const { data, error } = await supabase
    .from("estrategia_itens")
    .update({
      concluido,
      concluido_em: concluido ? new Date().toISOString() : null,
      atividade_id: atividadeId,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as EstrategiaItem;
}

import { createClient } from "@/lib/supabase/server";
import {
  createConteudoEditorial,
  deleteConteudoEditorial,
  updateConteudoEditorial,
} from "@/lib/db-conteudo-editorial";
import {
  STORY_TELA_LABELS,
  type StoriesPlano,
  type StoryTela,
} from "@/lib/ideias-labels";

export async function getStoriesPeriodo(
  inicio: string,
  fim: string,
): Promise<StoriesPlano[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories_plano")
    .select("*")
    .gte("data", inicio)
    .lte("data", fim)
    .order("data", { ascending: true });
  if (error) throw error;
  return (data ?? []) as StoriesPlano[];
}

function telasComoTexto(telas: StoryTela[]): string | null {
  const linhas = telas.map(
    (t, i) => `${i + 1}. ${STORY_TELA_LABELS[t.tipo]}${t.texto ? `: ${t.texto}` : ""}`,
  );
  return linhas.length ? linhas.join("\n") : null;
}

/**
 * Salva o plano de stories do dia e mantém um item "stories" no Calendário
 * Editorial ligado a ele (cria na primeira vez, atualiza nas seguintes).
 */
export async function salvarStoriesPlano(input: {
  data: string;
  tema: string;
  telas: StoryTela[];
}): Promise<StoriesPlano> {
  const supabase = await createClient();
  const tema = input.tema.trim();

  const { data: existente } = await supabase
    .from("stories_plano")
    .select("*")
    .eq("data", input.data)
    .maybeSingle();

  const observacoes = telasComoTexto(input.telas);
  const temaCalendario = tema || "Stories do dia";
  let conteudoId = (existente as StoriesPlano | null)?.conteudo_editorial_id ?? null;

  if (conteudoId) {
    await updateConteudoEditorial(conteudoId, {
      tema: temaCalendario,
      observacoes,
    });
  } else {
    const conteudo = await createConteudoEditorial({
      data: input.data,
      canal: "instagram",
      formato: "stories",
      pilar: "topo",
      tema: temaCalendario,
      utm_content: null,
      observacoes,
    });
    conteudoId = conteudo.id;
  }

  const { data, error } = await supabase
    .from("stories_plano")
    .upsert(
      {
        data: input.data,
        tema,
        telas: input.telas,
        conteudo_editorial_id: conteudoId,
      },
      { onConflict: "data" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as StoriesPlano;
}

export async function excluirStoriesPlano(data: string): Promise<void> {
  const supabase = await createClient();
  const { data: existente } = await supabase
    .from("stories_plano")
    .select("*")
    .eq("data", data)
    .maybeSingle();
  if (!existente) return;

  const { error } = await supabase.from("stories_plano").delete().eq("data", data);
  if (error) throw error;

  const conteudoId = (existente as StoriesPlano).conteudo_editorial_id;
  if (conteudoId) await deleteConteudoEditorial(conteudoId);
}

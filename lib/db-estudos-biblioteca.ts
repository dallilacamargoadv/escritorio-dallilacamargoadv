import bibliotecaJson from "@/content/estudos/biblioteca.json";
import { limparEtiquetas, normalizarEstado, type DocBiblioteca, type DocResumo, type EstadoBiblioteca } from "@/lib/estudos-biblioteca";
import { createClient } from "@/lib/supabase/server";

/**
 * Texto dos documentos fica só no servidor (gerado por CONCURSO PGE-MA/geradores/gerar_biblioteca.py).
 * PDFs originais no bucket privado "biblioteca", caminho "<id do documento>.pdf".
 */
export const BIBLIOTECA = bibliotecaJson as DocBiblioteca[];
export const DOC_POR_ID = new Map(BIBLIOTECA.map((d) => [d.id, d]));
export const BUCKET_BIBLIOTECA = "biblioteca";

export function resumo(d: DocBiblioteca): DocResumo {
  const { trechos, ...resto } = d;
  return { ...resto, total: trechos.length };
}

export async function getEstadoBiblioteca(): Promise<EstadoBiblioteca> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_config").select("valor").eq("chave", "biblioteca").maybeSingle();
  if (error) throw error;
  return normalizarEstado(data?.valor);
}

async function salvar(estado: EstadoBiblioteca) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("estudo_config")
    .upsert({ chave: "biblioteca", valor: estado, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Liga ou desliga o grifo de um artigo/página. Devolve se ficou grifado. */
export async function alternarGrifo(docId: string, ref: string): Promise<boolean> {
  const estado = await getEstadoBiblioteca();
  const atual = new Set(estado.grifos[docId] ?? []);
  const grifado = !atual.has(ref);
  if (grifado) atual.add(ref);
  else atual.delete(ref);
  estado.grifos[docId] = [...atual];
  if (!atual.size) delete estado.grifos[docId];
  await salvar(estado);
  return grifado;
}

export async function salvarEtiquetas(docId: string, etiquetas: unknown): Promise<string[]> {
  const estado = await getEstadoBiblioteca();
  const limpas = limparEtiquetas(etiquetas);
  if (limpas.length) estado.etiquetas[docId] = limpas;
  else delete estado.etiquetas[docId];
  await salvar(estado);
  return limpas;
}

/** Ids dos documentos que já têm o PDF enviado. */
export async function getPdfsEnviados(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET_BIBLIOTECA).list("", { limit: 200 });
  if (error) return new Set();
  return new Set((data ?? []).map((o) => o.name.replace(/\.pdf$/, "")));
}

export async function urlPdf(docId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET_BIBLIOTECA).createSignedUrl(`${docId}.pdf`, 60 * 30);
  if (error) return null;
  return data.signedUrl;
}

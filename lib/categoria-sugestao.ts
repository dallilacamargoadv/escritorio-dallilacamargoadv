const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "para", "com", "em", "no", "na", "nos", "nas",
  "os", "as", "um", "uma", "uns", "umas", "e", "a", "o",
]);

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

export interface DespesaHistoricoItem {
  descricao: string;
  categoria: string;
  subcategoria: string | null;
  created_at: string;
}

export interface SugestaoCategoria {
  categoria: string;
  subcategoria: string | null;
}

export function sugerirCategoria(
  descricaoDigitada: string,
  historico: DespesaHistoricoItem[],
): SugestaoCategoria | null {
  const palavras = new Set(normalizeWords(descricaoDigitada));
  if (palavras.size === 0) return null;

  const ordenado = historico
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  let melhor: { item: DespesaHistoricoItem; score: number } | null = null;
  for (const item of ordenado) {
    const score = normalizeWords(item.descricao).filter((p) => palavras.has(p)).length;
    if (score > 0 && (!melhor || score > melhor.score)) {
      melhor = { item, score };
    }
  }

  if (!melhor) return null;
  return { categoria: melhor.item.categoria, subcategoria: melhor.item.subcategoria };
}

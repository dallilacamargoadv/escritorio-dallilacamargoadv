// Texto das questões vem do banco próprio (content/estudos), mas mesmo assim só liberamos marcação simples.
const PERMITIDAS = ["b", "i", "u", "sup", "sub", "mark"];

export function htmlSeguro(texto: string): string {
  let s = texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  for (const t of PERMITIDAS) {
    s = s.replace(new RegExp(`&lt;(/?)${t}&gt;`, "g"), `<$1${t}>`);
  }
  return s.replace(/&lt;br\s*\/?&gt;/g, "<br>");
}

/** Fonte legal: ==trecho== vira destaque e quebra de linha vira <br>. */
export function fonteHtml(texto: string): string {
  return htmlSeguro(texto)
    .replace(/==([\s\S]+?)==/g, "<mark>$1</mark>")
    .replace(/\n/g, "<br>");
}

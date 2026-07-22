/**
 * Converte texto digitado em pt-BR (ex.: "4.500", "4500,50", "4.500,50")
 * pro número correto — "." é separador de milhar (ignorado), "," é decimal.
 */
export function parseCurrencyInput(raw: string): number {
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  return Number(cleaned);
}

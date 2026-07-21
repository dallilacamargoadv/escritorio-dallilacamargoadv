const API_URL = "https://comunicaapi.pje.jus.br/api/v1/comunicacao";

export interface ComunicaPjeItem {
  data_disponibilizacao: string;
  siglaTribunal: string;
  tipoComunicacao: string;
  nomeOrgao: string;
  texto: string;
}

interface ComunicaPjeResponse {
  status: string;
  count: number;
  items: ComunicaPjeItem[];
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Consulta pública do CNJ, sem autenticação — decisão registrada no HANDOFF.md. */
export async function fetchComunicaPje(numeroProcesso: string): Promise<ComunicaPjeItem[]> {
  const digits = onlyDigits(numeroProcesso);
  if (!digits) return [];

  const res = await fetch(`${API_URL}?numeroProcesso=${digits}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Comunica PJe respondeu ${res.status}`);

  const data = (await res.json()) as ComunicaPjeResponse;
  return data.items ?? [];
}

export function resumoComunicaPjeItem(item: ComunicaPjeItem): string {
  const texto = stripHtml(item.texto);
  const resumo = texto.length > 280 ? `${texto.slice(0, 280)}…` : texto;
  return `Atualização do processo (Comunica PJe, ${item.nomeOrgao}): ${resumo}`;
}

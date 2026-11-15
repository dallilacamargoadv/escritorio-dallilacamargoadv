// Biblioteca: tipos e lógica pura (busca sem acento, grifos e etiquetas).

export type TipoDoc = "lei" | "apostila" | "prova" | "material";

export interface Trecho {
  ref: string;
  t: string;
}

export interface DocBiblioteca {
  id: string;
  titulo: string;
  tipo: TipoDoc;
  materia_id: string;
  unidade: "artigo" | "página";
  pdf: string | null;
  aviso: string;
  trechos: Trecho[];
}

export type DocResumo = Omit<DocBiblioteca, "trechos"> & { total: number };

/** Estado em estudo_config, chave "biblioteca". */
export interface EstadoBiblioteca {
  grifos: Record<string, string[]>;
  etiquetas: Record<string, string[]>;
}

export const TIPO_LABEL: Record<TipoDoc, string> = {
  lei: "Lei seca",
  apostila: "Apostilas",
  prova: "Provas FCC",
  material: "Materiais",
};

export const POR_PAGINA = 30;

export function normalizarEstado(v: unknown): EstadoBiblioteca {
  const o = (v && typeof v === "object" ? v : {}) as Partial<EstadoBiblioteca>;
  const lista = (x: unknown) =>
    Object.fromEntries(
      Object.entries(x && typeof x === "object" ? x : {}).map(([k, arr]) => [
        k,
        Array.isArray(arr) ? arr.filter((s): s is string => typeof s === "string") : [],
      ]),
    );
  return { grifos: lista(o.grifos), etiquetas: lista(o.etiquetas) };
}

/** Minúsculas e sem acento, para comparar. */
export function semAcento(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Termos da busca (palavras com 2+ letras). Todas precisam aparecer no trecho. */
export function termos(q: string): string[] {
  return semAcento(q)
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}º.-]/gu, ""))
    .filter((t) => t.length >= 2)
    .slice(0, 6);
}

export function casa(texto: string, ts: string[]): boolean {
  if (!ts.length) return false;
  const n = semAcento(texto);
  return ts.every((t) => n.includes(t));
}

/** Recorte de ~220 caracteres em volta do primeiro termo encontrado. */
export function recorte(texto: string, ts: string[], tam = 220): string {
  const plano = texto.replace(/\s+/g, " ");
  const n = semAcento(plano);
  const i = ts.length ? Math.max(0, n.indexOf(ts[0])) : 0;
  const ini = Math.max(0, i - Math.floor(tam / 3));
  const fim = Math.min(plano.length, ini + tam);
  return (ini > 0 ? "… " : "") + plano.slice(ini, fim) + (fim < plano.length ? " …" : "");
}

/** Divide o texto em partes marcadas para grifar os termos (sem HTML). Funciona porque NFD sem acento preserva o tamanho em letras latinas comuns. */
export function partesGrifadas(texto: string, ts: string[]): { s: string; m: boolean }[] {
  if (!ts.length) return [{ s: texto, m: false }];
  const n = semAcento(texto);
  if (n.length !== texto.length) return [{ s: texto, m: false }];
  const marcas = new Array<boolean>(texto.length).fill(false);
  for (const t of ts) {
    let i = n.indexOf(t);
    while (i >= 0) {
      for (let k = i; k < i + t.length; k++) marcas[k] = true;
      i = n.indexOf(t, i + t.length);
    }
  }
  const out: { s: string; m: boolean }[] = [];
  for (let i = 0; i < texto.length; i++) {
    const ult = out[out.length - 1];
    if (ult && ult.m === marcas[i]) ult.s += texto[i];
    else out.push({ s: texto[i], m: marcas[i] });
  }
  return out;
}

export function limparEtiquetas(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out = new Set<string>();
  for (const e of v) {
    if (typeof e !== "string") continue;
    const t = e.trim().replace(/\s+/g, " ").slice(0, 30);
    if (t) out.add(t);
  }
  return [...out].slice(0, 12);
}

import temasJson from "@/content/estudos/redacao.json";
import casosJson from "@/content/estudos/discursivas.json";
import { normalizarRedacao, type CasoDiscursiva, type EstadoRedacao, type Grade, type Recorte, type TemaRedacao } from "@/lib/estudos-redacao";
import { createClient } from "@/lib/supabase/server";

export const TEMAS = temasJson as TemaRedacao[];
export const TEMA_POR_ID = new Map(TEMAS.map((t) => [t.id, t]));
export const CASOS = casosJson as CasoDiscursiva[];
export const CASO_POR_ID = new Map(CASOS.map((c) => [c.id, c]));

/** Estado em estudo_config, chave "redacao". */
export async function getEstadoRedacao(): Promise<EstadoRedacao> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estudo_config").select("valor").eq("chave", "redacao").maybeSingle();
  if (error) throw error;
  return normalizarRedacao(data?.valor);
}

async function salvar(estado: EstadoRedacao) {
  const supabase = await createClient();
  const { error } = await supabase.from("estudo_config").upsert({ chave: "redacao", valor: estado, updated_at: new Date().toISOString() });
  if (error) throw error;
}

const txt = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const num = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));

export async function salvarRedacao(id: string, body: { recorte?: unknown; texto?: unknown; grade?: unknown }): Promise<void> {
  const estado = await getEstadoRedacao();
  const r = (body.recorte ?? {}) as Partial<Recorte>;
  const g = body.grade as Partial<Grade> | null | undefined;
  estado.temas[id] = {
    recorte: { eixo: txt(r.eixo, 200), assunto: txt(r.assunto, 200), tema: txt(r.tema, 400), palavra: txt(r.palavra, 80) },
    texto: txt(body.texto, 12000),
    grade: g ? { conteudo: num(g.conteudo, 40), estrutura: num(g.estrutura, 30), expressao: num(g.expressao, 30) } : null,
    atualizado: new Date().toISOString(),
  };
  await salvar(estado);
}

export async function salvarDiscursiva(id: string, body: { texto?: unknown; pontos?: unknown }): Promise<void> {
  const estado = await getEstadoRedacao();
  const pontos: Record<string, 0 | 1 | 2> = {};
  if (body.pontos && typeof body.pontos === "object") {
    for (const [k, v] of Object.entries(body.pontos as Record<string, unknown>)) {
      if (/^\d{1,2}$/.test(k) && (v === 0 || v === 1 || v === 2)) pontos[k] = v;
    }
  }
  estado.casos[id] = { texto: txt(body.texto, 12000), pontos, atualizado: new Date().toISOString() };
  await salvar(estado);
}

export async function marcarSemanal(data: string, tipo: string, feito: boolean): Promise<void> {
  const estado = await getEstadoRedacao();
  const lista = new Set(estado.feitos[data] ?? []);
  if (feito) lista.add(tipo);
  else lista.delete(tipo);
  estado.feitos[data] = [...lista];
  await salvar(estado);
}

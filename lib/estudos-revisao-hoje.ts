// Revisão de hoje: subjetiva do dia, problema do dia de Matemática/RLM e o HTML dos cartões de erro.
// Lógica pura (servidor). Nada é escrito à mão: o texto sai dos cartões, das questões e da lei seca do banco.
import { addDaysToDateString } from "@/lib/atividades-utils";
import type { Questao, Resposta } from "@/lib/estudos-desempenho";
import { fonteHtml, htmlSeguro } from "@/lib/estudos-html";
import { BARALHO_ERROS, rotuloMotivo, type CartaoErro } from "@/lib/estudos-erros-cartoes";
import { lugarComCache, SEM_ASSUNTO } from "@/lib/estudos-cartoes-assunto";
import { dataBelem, ETAPA_FINAL, etapaDoCartao, type Cartao, type EstadoCartao } from "@/lib/estudos-revisao";

/* ===================== CARTÕES DE ERRO ===================== */

export const NOVOS_ERROS_POR_DIA = 5;

/**
 * Flashcard do erro (27/11): a frente é a questão inteira com as alternativas, para responder de novo.
 * O verso traz o que ela marcou antes, por que estava errado e o certo. Extra: motivo, nota e regra.
 */
export function htmlDoCartaoErro(c: CartaoErro, q?: Questao) {
  const p = c.pegadinhas[0];
  const rotulo = (t: string) => `<span class="block text-[11px] uppercase tracking-[0.14em] text-e-dim">${t}</span>`;
  const itens = c.itens.length ? `<br>${c.itens.map(htmlSeguro).join("<br>")}` : "";
  const frente =
    `<span class="block text-[11px] text-e-dim">${htmlSeguro(`${c.materia} · ${c.grupoNome} · ${c.ref}`)}</span>` +
    `<span class="mt-1 block">${htmlSeguro(c.enun)}${itens}</span>`;
  const verso =
    (p
      ? `${rotulo(`Você marcou antes${p.vezes > 1 ? ` (${p.vezes} vezes)` : ""}`)}<span class="mt-1 block border-l-2 border-e-bad/60 pl-3">“${htmlSeguro(p.marcada)}”: ${htmlSeguro(p.texto)}</span>`
      : `${rotulo("Antes")}<span class="mt-1 block text-e-dim">Você acertou sem firmeza.</span>`) +
    `<span class="mt-3 block">${rotulo("O certo")}</span><span class="mt-1 block border-l-2 border-e-ok/60 pl-3">${htmlSeguro(c.certa)}</span>`;
  const alts = q?.alts?.length ? q.alts.map(htmlSeguro) : [];
  const porque = q?.why?.length ? q.why.map(htmlSeguro) : [];
  const nota = c.notas.at(-1);
  const extra = [
    `Motivo: ${c.motivos.map(rotuloMotivo).join(", ")} · ${c.vezes === 1 ? "1 erro" : `${c.vezes} erros`}${c.superado ? " · já acertou firme depois" : ""}.`,
    nota ? `<i>Sua nota: “${htmlSeguro(nota.length > 400 ? nota.slice(0, 400) + "…" : nota)}”</i>` : "",
    c.regra ? `Regra do subtema: ${htmlSeguro(c.regra)}` : "",
  ]
    .filter(Boolean)
    .join("<br><br>");
  return {
    frente,
    verso,
    extra,
    lei: c.fonte ? fonteHtml(c.fonte) : "",
    fcc: c.alerta ? htmlSeguro(c.alerta) : "",
    baralho: BARALHO_ERROS,
    alts,
    correta: q && alts.length ? q.c : undefined,
    porque,
  };
}

/* ===================== SUBJETIVA DO DIA ===================== */

/** Segunda, terça, quinta e sexta. */
const DIAS_SUBJETIVA = new Set([1, 2, 4, 5]);
const NOME_DIA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const diaDaSemana = (data: string) => new Date(`${data}T12:00:00Z`).getUTCDay();
export const temSubjetiva = (hoje: string) => DIAS_SUBJETIVA.has(diaDaSemana(hoje));
export function proximaSubjetiva(hoje: string): string {
  for (let i = 1; i <= 7; i++) {
    const d = addDaysToDateString(hoje, i);
    if (temSubjetiva(d)) return NOME_DIA[diaDaSemana(d)];
  }
  return "";
}

export interface PerguntaSubjetiva {
  cartao_id: string;
  etapa: number;
  /** o que ela escreveu hoje, se já respondeu */
  escrita: string;
  pergunta: string;
  resposta: string;
  extra: string;
  lei: string;
  /** de onde veio a lei seca: "cartão" ou a referência da questão do banco */
  leiOrigem: string;
  fcc: string;
}
export interface Subjetiva {
  tema: string;
  materia: string;
  /** quantos itens desse tema vencem hoje */
  vencendo: number;
  /** já respondida hoje (ficou salva no cartão): mostra o que ela escreveu */
  feita: boolean;
  perguntas: PerguntaSubjetiva[];
}

const artigosCitados = (t: string) => new Set([...t.matchAll(/art\.?\s*(\d+)/gi)].map((m) => m[1]));

/**
 * O tema da subjetiva é o que tem mais itens vencendo hoje (questões e cartões), entre os que têm cartão para virar pergunta.
 * Perguntas: até 2 cartões do tema, primeiro os com lei seca, primeiro os vencidos.
 * A lei seca vem do próprio cartão; sem ela, da questão do banco do mesmo tema que cita o mesmo artigo.
 */
export function escolherSubjetiva(
  hoje: string,
  temasVencendo: Map<string, number>,
  cartoes: Cartao[],
  estados: Map<string, EstadoCartao>,
  venceHoje: (id: string) => boolean,
  questoes: Questao[],
): Subjetiva | null {
  const montar = (c: Cartao): PerguntaSubjetiva => {
    let lei = c.lei ? htmlSeguro(c.lei) : "";
    let leiOrigem = c.lei ? "cartão" : "";
    if (!lei) {
      const tema = lugarComCache(c).assunto;
      const arts = artigosCitados(`${c.f} ${c.v} ${c.x ?? ""}`);
      const q = questoes.find((x) => x.tema === tema && x.fonte && [...artigosCitados(x.ref)].some((a) => arts.has(a)));
      if (q?.fonte) {
        lei = fonteHtml(q.fonte);
        leiOrigem = q.ref;
      }
    }
    const e = estados.get(c.id);
    const escrita = e && typeof e.respEm === "number" && dataBelem(e.respEm) === hoje && typeof e.resp === "string" ? htmlSeguro(e.resp) : "";
    return {
      cartao_id: c.id,
      etapa: e ? etapaDoCartao(e) : -1,
      escrita,
      pergunta: htmlSeguro(c.f),
      resposta: htmlSeguro(c.v),
      extra: c.x ? htmlSeguro(c.x) : "",
      lei,
      leiOrigem,
      fcc: c.fcc ? htmlSeguro(c.fcc) : "",
    };
  };

  // Já respondida hoje: a resposta escrita fica no cartão (respEm). Mostra a mesma subjetiva, sem sortear outra.
  const feitas = cartoes.filter((c) => {
    const e = estados.get(c.id);
    return e && typeof e.respEm === "number" && dataBelem(e.respEm) === hoje;
  });
  if (feitas.length) {
    const tema = lugarComCache(feitas[0]).assunto;
    return { tema, materia: feitas[0].b, vencendo: temasVencendo.get(tema) ?? 0, feita: true, perguntas: feitas.slice(0, 2).map(montar) };
  }

  const porTema = new Map<string, Cartao[]>();
  for (const c of cartoes) {
    const e = estados.get(c.id);
    if (e && etapaDoCartao(e) >= ETAPA_FINAL) continue;
    // já respondido hoje (na subjetiva ou na fila): não repete
    if (e && typeof e.last === "number" && dataBelem(e.last) === hoje) continue;
    const tema = lugarComCache(c).assunto;
    if (tema === SEM_ASSUNTO) continue;
    porTema.set(tema, [...(porTema.get(tema) ?? []), c]);
  }
  const temas = [...temasVencendo.entries()].filter(([t]) => porTema.has(t)).sort((a, b) => b[1] - a[1]);
  if (!temas.length) return null;
  const [tema, vencendo] = temas.find(([t]) => porTema.get(t)!.some((c) => c.lei)) ?? temas[0];
  const escolhidos = [...porTema.get(tema)!]
    .sort((a, b) => Number(!a.lei) - Number(!b.lei) || Number(!venceHoje(a.id)) - Number(!venceHoje(b.id)))
    .slice(0, 2);
  return { tema, materia: escolhidos[0]?.b ?? "", vencendo, feita: false, perguntas: escolhidos.map(montar) };
}

/* ===================== PROBLEMA DO DIA (RLM) ===================== */

/** Tema das questões de Matemática/RLM → aula do caderno A2. Lógica proposicional (estruturas, argumentação) fica de fora. */
export const AULA_DO_TEMA_RLM: Record<string, string> = {
  "Frações, MMC e MDC": "A2-a05",
  "Problemas aritméticos": "A2-a05",
  "Razão, proporção e regra de três": "A2-a06",
  Porcentagem: "A2-a07",
  Contagem: "A2-a08",
  Probabilidade: "A2-a09",
  "Estatística": "A2-a10",
};

export interface ProblemaDoDia {
  questao_id: string;
  materia_id: string;
  tema: string;
  enun: string;
  /** feito hoje: true acertou, false errou, null ainda não */
  feitoHoje: boolean | null;
  /** temas que entram no sorteio */
  temas: string[];
  /** as aulas vieram das marcadas como estudadas (true) ou das publicadas, se nenhuma foi marcada (false) */
  pelasMarcadas: boolean;
}

function hash(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * Um problema por dia, sorteado (fixo no dia) entre as questões de RLM dos temas com aula estudada.
 * Prefere as nunca respondidas; depois as que ela errou da última vez.
 */
export function problemaDoDia(
  hoje: string,
  questoes: Questao[],
  respostas: Resposta[],
  aulasVistas: Set<string>,
  pelasMarcadas: boolean,
): ProblemaDoDia | null {
  const temas = Object.keys(AULA_DO_TEMA_RLM).filter((t) => aulasVistas.has(AULA_DO_TEMA_RLM[t]));
  const pool = questoes.filter((q) => q.materia_id === "A2" && temas.includes(q.tema)).sort((a, b) => a.id.localeCompare(b.id));
  if (!pool.length) return null;
  const antes = new Map<string, Resposta>();
  const hojeR = new Map<string, Resposta>();
  for (const r of respostas) {
    const d = dataBelem(r.respondida_em);
    if (d === hoje) hojeR.set(r.questao_id, r);
    else if (d < hoje) {
      const a = antes.get(r.questao_id);
      if (!a || a.respondida_em < r.respondida_em) antes.set(r.questao_id, r);
    }
  }
  const nunca = pool.filter((q) => !antes.has(q.id));
  const errou = pool.filter((q) => antes.has(q.id) && !antes.get(q.id)!.correta);
  const lista = nunca.length ? nunca : errou.length ? errou : pool;
  const q = lista[hash(hoje) % lista.length];
  const r = hojeR.get(q.id);
  return {
    questao_id: q.id,
    materia_id: q.materia_id,
    tema: q.tema,
    enun: htmlSeguro(q.enun),
    feitoHoje: r ? r.correta : null,
    temas: [...new Set(pool.map((x) => x.tema))],
    pelasMarcadas,
  };
}

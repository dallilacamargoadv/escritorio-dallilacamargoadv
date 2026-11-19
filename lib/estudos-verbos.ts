// Treino de verbos (regulares e irregulares) para a FCC. Lógica pura, roda no cliente.
// Tabelas e banco em content/estudos/verbos.json, gerado por CONCURSO PGE-MA/geradores/verbos_treino.py.
import dados from "@/content/estudos/verbos.json";

export type Tempo = "pres" | "perf" | "imp" | "mqp" | "fpres" | "fpret" | "psub" | "isub" | "fsub" | "inf";
export interface Verbo {
  tempos: Record<Tempo, string[]>;
  participio: string;
  gerundio: string;
  regular: boolean;
  complemento: string;
  base: string | null;
  nivel: number;
}
export interface QuestaoBanco {
  id: string;
  frase: string;
  verbo: string;
  tempo: Tempo;
  pessoa: number;
  resposta: string;
  dica: string | null;
  nivel: number;
}
export const VERBOS = dados.verbos as unknown as Record<string, Verbo>;
const BANCO = dados.banco as QuestaoBanco[];

export const PESSOAS = ["eu", "tu", "ele", "nós", "vós", "eles"];
export const TEMPOS: Tempo[] = ["pres", "perf", "imp", "mqp", "fpres", "fpret", "psub", "isub", "fsub", "inf"];

/** Nome, pista na frase e como se monta. Linguagem simples, sem juridiquês gramatical. */
export const TEMPO_INFO: Record<Tempo, { nome: string; curto: string; pista: string; terminacao: string }> = {
  pres: { nome: "presente", curto: "presente", pista: "fala de agora ou de algo que sempre acontece (hoje, todo dia)", terminacao: "" },
  perf: { nome: "pretérito perfeito", curto: "passado acabado", pista: "ação que já terminou (ontem, já, na semana passada)", terminacao: "" },
  imp: { nome: "pretérito imperfeito", curto: "passado de costume", pista: "costume ou cena no passado (antigamente, sempre, enquanto)", terminacao: "-ava (verbos em -ar) ou -ia (em -er e -ir)" },
  mqp: { nome: "pretérito mais-que-perfeito", curto: "passado antes do passado", pista: "algo que aconteceu antes de outro fato passado (quando ela chegou, ele já...)", terminacao: "-ra: pegue o “eles” do perfeito, que já termina em -ram, e tire o “m”" },
  fpres: { nome: "futuro do presente", curto: "futuro", pista: "vai acontecer (amanhã, semana que vem)", terminacao: "verbo inteiro + -ei, -ás, -á, -emos, -eis, -ão" },
  fpret: { nome: "futuro do pretérito", curto: "o “-ria”", pista: "algo que aconteceria numa condição (se pudesse, ele faria)", terminacao: "verbo inteiro + -ia, -ias, -ia, -íamos, -íeis, -iam" },
  psub: { nome: "presente do subjuntivo", curto: "subjuntivo do “que”", pista: "vem depois de “que”, “talvez”, “espero que”, “é preciso que”", terminacao: "pegue o “eu” do presente, tire o -o e troque: -ar vira -e, -er e -ir viram -a" },
  isub: { nome: "imperfeito do subjuntivo", curto: "subjuntivo do “se” no passado", pista: "hipótese com “se” que conversa com -ria (se ele tivesse, ganharia)", terminacao: "pegue o “eles” do perfeito, tire o -ram e ponha -sse, -sses, -sse, -ssemos, -sseis, -ssem" },
  fsub: { nome: "futuro do subjuntivo", curto: "subjuntivo do “se/quando” no futuro", pista: "“se” ou “quando” falando do futuro (quando ele vier, se eles virem)", terminacao: "pegue o “eles” do perfeito, tire o -ram e ponha -r, -res, -r, -rmos, -rdes, -rem" },
  inf: { nome: "infinitivo pessoal", curto: "infinitivo com dono", pista: "“para eu”, “para eles”, “ao”, verbo que não é conjugado mas tem sujeito", terminacao: "verbo inteiro + nada, -es, nada, -mos, -des, -em" },
};

const FIM_ISUB = ["sse", "sses", "sse", "ssemos", "sseis", "ssem"];
const FIM_FSUB = ["r", "res", "r", "rmos", "rdes", "rem"];
const FIM_FPRES = ["ei", "ás", "á", "emos", "eis", "ão"];
const FIM_FPRET = ["ia", "ias", "ia", "íamos", "íeis", "iam"];
const MARCA_PESSOA = [
  "Marca do EU: no presente quase sempre termina em -o (falo, venho, vejo); no perfeito, em -i ou -ei (vi, falei).",
  "Marca do TU: termina em -s (vês, vens, tiveres).",
  "Marca do ELE: é a forma sem marca nenhuma, a mais “pelada” (vê, vem, tivesse, vier).",
  "Marca do NÓS: termina sempre em -mos (vemos, viemos, tivéssemos).",
  "Marca do VÓS: termina em -is, -des ou -stes (vedes, vindes, vistes).",
  "Marca do ELES: termina sempre em -m (veem, vêm, tivessem, vierem).",
];
const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

// ---------- Níveis ----------
export interface Nivel {
  n: number;
  titulo: string;
  verbos: string[];
  tempos: Tempo[];
  pessoas: number[];
  ancora: boolean;
}
const TODOS = Object.keys(VERBOS);
// Haver só entra pelo banco (impessoal: houve, havia); nas frases montadas ficaria artificial.
const GERAVEIS = TODOS.filter((v) => v !== "haver");
const PESSOAS_FCC = [0, 2, 3, 5];
export const NIVEIS: Nivel[] = [
  { n: 1, titulo: "Regulares: falar, vender, partir", verbos: ["falar", "vender", "partir"], tempos: TEMPOS, pessoas: PESSOAS_FCC, ancora: true },
  { n: 2, titulo: "Ver e vir, com âncora", verbos: ["ver", "vir"], tempos: ["pres", "perf", "fpres", "psub", "isub", "fsub"], pessoas: PESSOAS_FCC, ancora: true },
  { n: 3, titulo: "Ver e vir sem âncora, com ter e pôr", verbos: ["ver", "vir", "ter", "pôr"], tempos: TEMPOS, pessoas: PESSOAS_FCC, ancora: false },
  { n: 4, titulo: "Derivados: manter, intervir, prever, prover, dispor, satisfazer, desfazer", verbos: TODOS.filter((v) => VERBOS[v].nivel === 4), tempos: TEMPOS, pessoas: PESSOAS_FCC, ancora: false },
  { n: 5, titulo: "Fazer, haver, requerer, reaver, dar, estar, ser, ir", verbos: GERAVEIS.filter((v) => VERBOS[v].nivel === 5), tempos: TEMPOS, pessoas: PESSOAS_FCC, ancora: false },
  { n: 6, titulo: "Trazer, dizer, saber, caber, poder, querer, valer, ler, crer, ouvir, pedir, medir, rir, perder", verbos: TODOS.filter((v) => VERBOS[v].nivel === 6), tempos: TEMPOS, pessoas: PESSOAS_FCC, ancora: false },
  { n: 7, titulo: "Vós, em todos os tempos", verbos: GERAVEIS, tempos: TEMPOS, pessoas: [4], ancora: false },
  { n: 8, titulo: "Simulado misto estilo FCC (20 questões)", verbos: GERAVEIS, tempos: TEMPOS, pessoas: PESSOAS_FCC, ancora: false },
];

// ---------- Questões ----------
export interface Questao {
  id: string;
  chave: string; // verbo|tempo|pessoa, para o registro de erros
  verbo: string;
  tempo: Tempo;
  pessoa: number;
  frase: string; // com ____
  sujeito: string; // como a pessoa aparece na frase
  dica: string;
  resposta: string;
  opcoes: string[];
  impessoal?: boolean;
}

const SUJEITOS: Record<number, string[]> = {
  0: ["eu"],
  1: ["tu"],
  2: ["a juíza", "o advogado", "ele", "ela", "a procuradora", "o perito"],
  3: ["nós"],
  4: ["vós"],
  5: ["os peritos", "eles", "as partes", "os procuradores", "elas"],
};
const MOLDE: Record<Tempo, (s: string, c: string) => string> = {
  pres: (s, c) => `Hoje, ${s} ____ ${c}.`,
  perf: (s, c) => `Ontem, ${s} ____ ${c}.`,
  imp: (s, c) => `Antigamente, ${s} sempre ____ ${c}.`,
  mqp: (s, c) => `Quando a audiência começou, ${s} já ____ ${c}.`,
  fpres: (s, c) => `Amanhã, ${s} ____ ${c}.`,
  fpret: (s, c) => `Se tivesse tempo, ${s} ____ ${c}.`,
  psub: (s, c) => `Espero que ${s} ____ ${c}.`,
  isub: (s, c) => `Se ${s} ____ ${c}, tudo seria diferente.`,
  fsub: (s, c) => `Quando ${s} ____ ${c}, tudo vai mudar.`,
  inf: (s, c) => `O juiz deu prazo para ${s} ____ ${c}.`,
};
const SENTIDO: Record<string, string> = { ver: "olhar", vir: "chegar", prever: "antever, olhar antes", prover: "preencher, abastecer", intervir: "entrar no meio" };
const GEMEO: Record<string, string> = { ver: "vir", vir: "ver", prever: "prover", prover: "prever", ter: "vir", ler: "ver", crer: "ver", manter: "intervir", intervir: "manter" };
const ARMADILHAS: Record<string, string[]> = {
  "ver|fsub": ["ver", "verem", "vermos"],
  "prever|fsub": ["prever", "preverem"],
  "intervir|perf": ["interviu", "interviram"],
  "requerer|perf": ["requis", "requiseram"],
  "reaver|perf": ["reaveu", "reaveram"],
  "prover|perf": ["proviu", "proviram"],
  "ver|pres": ["vêem", "vêm"],
  "ler|pres": ["lêem"],
  "crer|pres": ["crêem"],
  "dar|psub": ["dêem"],
  "manter|pres": ["mantem", "mantéem"],
};

function rnd<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}
export function embaralhar<T>(xs: T[]): T[] {
  return xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}

function opcoesPara(verbo: string, tempo: Tempo, pessoa: number, resposta: string): string[] {
  const v = VERBOS[verbo];
  const pool: string[] = [];
  const g = GEMEO[verbo];
  if (g) pool.push(VERBOS[g].tempos[tempo][pessoa], VERBOS[g].tempos[tempo][pessoa === 2 ? 5 : pessoa === 5 ? 2 : pessoa]);
  pool.push(...(ARMADILHAS[`${verbo}|${tempo}`] ?? []));
  const vizinhos: Tempo[] = tempo === "fsub" ? ["isub", "perf", "inf"] : tempo === "isub" ? ["fsub", "perf", "psub"] : tempo === "psub" ? ["pres", "isub", "fsub"] : tempo === "pres" ? ["psub", "perf"] : tempo === "perf" ? ["pres", "fsub", "mqp"] : ["pres", "perf", "isub", "fsub"];
  for (const t of vizinhos) pool.push(v.tempos[t][pessoa]);
  pool.push(v.tempos[tempo][pessoa === 2 ? 5 : pessoa === 5 ? 2 : 2], verbo);
  const usados = new Set([resposta]);
  const distr: string[] = [];
  for (const x of embaralhar(pool.slice(0, 4)).concat(embaralhar(pool.slice(4)))) {
    if (!x || usados.has(x)) continue;
    usados.add(x);
    distr.push(x);
    if (distr.length === 3) break;
  }
  return embaralhar([resposta, ...distr]);
}

function dicaPara(verbo: string, nivel: Nivel): string {
  if (nivel.ancora && SENTIDO[verbo]) return `cabe “${SENTIDO[verbo]}”`;
  return `verbo ${verbo.toUpperCase()}`;
}

export function gerarQuestao(nivel: Nivel, alvo?: { verbo: string; tempo: Tempo; pessoa: number }): Questao | null {
  if (alvo?.verbo === "haver") {
    const b = BANCO.find((x) => x.verbo === "haver" && x.tempo === alvo.tempo && x.pessoa === alvo.pessoa);
    return b ? doBanco(b, nivel) : null;
  }
  for (let tentativa = 0; tentativa < 30; tentativa++) {
    const verbo = alvo?.verbo ?? rnd(nivel.verbos);
    const tempo = alvo?.tempo ?? rnd(nivel.tempos);
    const pessoa = alvo?.pessoa ?? rnd(nivel.pessoas);
    const v = VERBOS[verbo];
    const resposta = v?.tempos[tempo]?.[pessoa];
    if (!resposta) {
      if (alvo) return null;
      continue;
    }
    const sujeito = rnd(SUJEITOS[pessoa]);
    const comeco = MOLDE[tempo](sujeito, v.complemento);
    return {
      id: `g-${verbo}-${tempo}-${pessoa}-${Math.random().toString(36).slice(2, 7)}`,
      chave: `${verbo}|${tempo}|${pessoa}`,
      verbo,
      tempo,
      pessoa,
      frase: comeco.charAt(0).toUpperCase() + comeco.slice(1),
      sujeito,
      dica: dicaPara(verbo, nivel),
      resposta,
      opcoes: opcoesPara(verbo, tempo, pessoa, resposta),
    };
  }
  return null;
}

function doBanco(b: QuestaoBanco, nivel: Nivel): Questao {
  return {
    id: b.id,
    chave: `${b.verbo}|${b.tempo}|${b.pessoa}`,
    verbo: b.verbo,
    tempo: b.tempo,
    pessoa: b.pessoa,
    frase: b.frase,
    sujeito: "",
    dica: b.dica ?? dicaPara(b.verbo, nivel),
    resposta: b.resposta,
    opcoes: opcoesPara(b.verbo, b.tempo, b.pessoa, b.resposta),
    impessoal: b.verbo === "haver" && b.frase.startsWith("____") ? true : b.frase.startsWith("Não ____") && b.verbo === "haver",
  };
}

/** Rodada: primeiro os erros pendentes daquele nível, depois o banco, depois questões geradas. */
export function montarRodada(nivel: Nivel, erros: RegistroErro[], tamanho: number, soErros = false): Questao[] {
  const out: Questao[] = [];
  const pend = embaralhar(erros.filter((e) => e.acertos < 2 && (soErros || nivel.verbos.includes(e.verbo))));
  for (const e of pend.slice(0, soErros ? tamanho : 2)) {
    const q = gerarQuestao(nivel, { verbo: e.verbo, tempo: e.tempo, pessoa: e.pessoa });
    if (q) out.push(q);
  }
  if (soErros) return out;
  const banco = embaralhar(BANCO.filter((b) => (nivel.n === 8 ? true : b.nivel === nivel.n)));
  const nBanco = Math.ceil((tamanho - out.length) / 2);
  out.push(...banco.slice(0, nBanco).map((b) => doBanco(b, nivel)));
  while (out.length < tamanho) {
    const q = gerarQuestao(nivel);
    if (!q) break;
    if (!out.some((x) => x.chave === q.chave)) out.push(q);
  }
  return out.slice(0, tamanho);
}

// ---------- Explicação ("olha, esse aqui é o ele do subjuntivo...") ----------
export interface Explicacao {
  titulo: string; // "Isso é o ELE do imperfeito do subjuntivo"
  pista: string;
  monta: string;
  extra: string[];
}

function quemE(q: Questao): string {
  const p = PESSOAS[q.pessoa].toUpperCase();
  if (q.impessoal) return "o ELE (haver no sentido de existir não tem sujeito e fica no singular)";
  if (q.sujeito && !["eu", "tu", "ele", "nós", "vós", "eles"].includes(q.sujeito)) return `o ${p} (“${q.sujeito}” = ${PESSOAS[q.pessoa]})`;
  return `o ${p}`;
}

export function explicar(q: Questao): Explicacao {
  const v = VERBOS[q.verbo];
  const info = TEMPO_INFO[q.tempo];
  const forma = q.resposta;
  const extra: string[] = [];
  let monta = "";
  const perfEles = v.tempos.perf[5];
  if (q.tempo === "isub" || q.tempo === "fsub" || q.tempo === "mqp") {
    const rad = perfEles.replace(/ram$/, "");
    const fim = q.tempo === "isub" ? FIM_ISUB[q.pessoa] : q.tempo === "fsub" ? FIM_FSUB[q.pessoa] : "";
    if (q.tempo === "mqp") monta = `Pegue o “eles” do perfeito: ${perfEles}. Tire o “m” e ajuste a pessoa: ${forma}.`;
    else if (semAcento(rad + fim) === semAcento(forma)) monta = `Pegue o “eles” do perfeito: ${perfEles}. Tire o -ram e fica “${rad}”. Ponha -${fim}: ${forma}.`;
    else monta = `A forma é ${forma}. Ela não segue a montagem pelo perfeito, então decore.`;
  } else if (q.tempo === "psub") {
    const eu = v.tempos.pres[0];
    const rad = eu.replace(/o$/, "");
    if (eu.endsWith("o") && v.tempos.psub[0].startsWith(rad)) monta = `Pegue o “eu” do presente: ${eu}. Tire o -o e fica “${rad}”. Troque a vogal: ${forma}.`;
    else monta = `É um dos que fogem da regra: o “eu” do presente é ${eu || "inexistente"}, mas o subjuntivo é ${v.tempos.psub[0] || "inexistente"}. Decore: ${forma}.`;
  } else if (q.tempo === "fpres" || q.tempo === "fpret") {
    const fim = (q.tempo === "fpres" ? FIM_FPRES : FIM_FPRET)[q.pessoa];
    const inf = q.verbo;
    if (semAcento(inf + fim) === semAcento(forma)) monta = `Verbo inteiro + terminação: ${inf} + ${fim} = ${forma}.`;
    else monta = `Esse foge: não usa o verbo inteiro, usa “${forma.slice(0, forma.length - fim.length)}-”. Fica ${forma}.`;
  } else if (q.tempo === "inf") {
    monta = `Verbo inteiro + a marca da pessoa: ${forma}. Igual ao futuro do subjuntivo só nos verbos regulares.`;
  } else if (v.regular) {
    const r = q.verbo.slice(0, -2);
    monta = `Verbo regular: o pedaço “${r}-” não muda. Só troca a terminação: ${forma.slice(r.length) ? `-${forma.slice(r.length)}` : forma}.`;
  } else {
    const reg = VERBOS[q.verbo.endsWith("ar") ? "falar" : q.verbo.endsWith("ir") || q.verbo.endsWith("or") ? "partir" : "vender"].tempos[q.tempo][q.pessoa];
    monta = `Verbo irregular: o começo muda neste tempo, então a forma é ${forma}. Compare com um regular na mesma pessoa e tempo: ${reg}.`;
  }

  extra.unshift(MARCA_PESSOA[q.pessoa]);
  if (q.verbo === "ver" || q.verbo === "vir" || q.verbo === "prever" || q.verbo === "intervir") {
    extra.push("Teste: cabe “olhar”? É ver. Cabe “chegar”? É vir.");
    if (q.tempo === "pres" && q.pessoa === 5) extra.push("Âncora: “têm, vêm; leem, veem”. Chapéu é de ter e vir; dois “e” é de ler, crer e ver.");
    if (q.tempo === "fsub") extra.push("Âncora do futuro do subjuntivo: “ver vira vir, vir vira vier”.");
  }
  if (q.verbo === "ler" || q.verbo === "crer" || (q.verbo === "dar" && q.tempo === "psub")) {
    if (q.pessoa === 5) extra.push("Desde a reforma ortográfica, “leem, creem, veem, deem” não têm acento.");
  }
  if (v.base) extra.push(`Derivado copia o verbo-base: ${q.verbo} conjuga igual a ${v.base} (${VERBOS[v.base].tempos[q.tempo][q.pessoa] || "sem essa forma"} → ${forma}).`);
  if (q.verbo === "prover") extra.push("Prover é a única fuga: não copia o ver no passado (proveu, provesse, prover).");
  if (q.verbo === "requerer") extra.push("Requerer não segue querer: requereu, requeresse, requerer (nada de “requis”).");
  if (q.verbo === "reaver") extra.push("Reaver só existe onde o haver tem “v”; no passado vira reouve, reouvesse, reouver.");
  if (q.impessoal) extra.push("Haver = existir ou ocorrer fica no singular em qualquer tempo: houve, havia, haverá.");
  if (q.pessoa === 4) extra.push("Vós: perfeito sempre em -stes; futuro do subjuntivo em -des; presente de ter, vir, ver, pôr, ler, crer e ir em -des (tendes, vindes, vedes, pondes, ledes, credes, ides).");

  return { titulo: `Isso é ${quemE(q)} do ${info.nome.toUpperCase()}.`, pista: `Pista na frase: ${info.pista}.`, monta, extra };
}

/** Mini tabela: o tempo da questão, a pessoa marcada, e o verbo gêmeo quando confunde (ver × vir). */
export function miniTabela(q: Questao): { cabecalho: string[]; linhas: { pessoa: string; formas: string[]; marcada: boolean }[] } {
  const verbos = [q.verbo, ...(["ver", "vir"].includes(q.verbo) ? [GEMEO[q.verbo]] : VERBOS[q.verbo].base ? [VERBOS[q.verbo].base as string] : [])];
  return {
    cabecalho: verbos.map((v) => v.toUpperCase()),
    linhas: PESSOAS.map((p, i) => ({ pessoa: p, formas: verbos.map((v) => VERBOS[v].tempos[q.tempo][i] || "não existe"), marcada: i === q.pessoa })),
  };
}

// ---------- Outros modos ----------
export interface ConjugacaoPedido {
  verbo: string;
  tempo: Tempo;
}
export function pedidoConjugacao(nivel: Nivel): ConjugacaoPedido {
  for (;;) {
    const verbo = rnd(nivel.verbos);
    const tempo = rnd(nivel.tempos);
    if (VERBOS[verbo].tempos[tempo].every(Boolean)) return { verbo, tempo };
  }
}
export const normalizar = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export interface QuestaoForma {
  forma: string;
  certas: string[];
  opcoes: string[];
}
const descr = (v: string, t: Tempo, p: number) => `${v}, ${TEMPO_INFO[t].nome}, ${PESSOAS[p]}`;
export function questaoForma(nivel: Nivel): QuestaoForma {
  const verbo = rnd(nivel.verbos);
  const tempo = rnd(nivel.tempos);
  const pessoa = rnd(nivel.pessoas.length ? nivel.pessoas : [2]);
  const forma = VERBOS[verbo].tempos[tempo][pessoa] || VERBOS[verbo].tempos.perf[2];
  const certas: string[] = [];
  for (const v of TODOS) for (const t of TEMPOS) VERBOS[v].tempos[t].forEach((f, i) => f === forma && certas.push(descr(v, t, i)));
  const certa = rnd(certas.filter((c) => c.startsWith(verbo + ",")));
  const pool: string[] = [];
  const g = GEMEO[verbo] ?? verbo;
  for (const t of embaralhar(TEMPOS).slice(0, 4)) pool.push(descr(verbo, t, pessoa), descr(g, t, pessoa));
  const distr = embaralhar([...new Set(pool)].filter((d) => !certas.includes(d))).slice(0, 3);
  return { forma, certas, opcoes: embaralhar([certa, ...distr]) };
}

const PARES_ACENTO: [string, string][] = [["ter", "razão"], ["manter", "a posição"], ["vir", "ao fórum"], ["intervir", "no processo"], ["ver", "o erro"], ["prever", "o risco"], ["ler", "o contrato"], ["crer", "na tese"]];
export function questaoAcento(): Questao {
  const [verbo] = rnd(PARES_ACENTO.filter(([v]) => VERBOS[v]));
  const pessoa = rnd([2, 5]);
  const v = VERBOS[verbo];
  const resposta = v.tempos.pres[pessoa];
  const sujeito = pessoa === 2 ? rnd(["o réu", "a juíza", "o perito"]) : rnd(["os réus", "as juízas", "os peritos"]);
  const base = new Set([v.tempos.pres[2], v.tempos.pres[5], ...(ARMADILHAS[`${verbo}|pres`] ?? [])]);
  if (verbo === "ver" || verbo === "ler" || verbo === "crer" || verbo === "prever") base.add(v.tempos.pres[5].replace(/eem$/, "êem"));
  if (verbo === "ter" || verbo === "vir" || verbo === "manter" || verbo === "intervir") base.add(v.tempos.pres[2].replace(/é?m$/, "em").replace(/ê/, "e"));
  const frase = `${sujeito.charAt(0).toUpperCase() + sujeito.slice(1)} ____ ${v.complemento} todos os dias.`;
  return {
    id: `a-${verbo}-${pessoa}-${Math.random().toString(36).slice(2, 6)}`,
    chave: `${verbo}|pres|${pessoa}`,
    verbo,
    tempo: "pres",
    pessoa,
    frase,
    sujeito,
    dica: `verbo ${verbo.toUpperCase()}`,
    resposta,
    opcoes: embaralhar([resposta, ...[...base].filter((x) => x && x !== resposta).slice(0, 3)]),
  };
}

// ---------- Estado salvo (estudo_config, chave "verbos") ----------
export interface RegistroErro {
  verbo: string;
  tempo: Tempo;
  pessoa: number;
  errou: string;
  certo: string;
  vezes: number;
  acertos: number;
  data: string;
}
export interface EstadoVerbos {
  nivelMax: number;
  hist: Record<string, boolean[]>; // últimas 10 sem dica, por nível
  erros: Record<string, RegistroErro>;
  feitas: number;
  certas: number;
  dias: Record<string, number>;
}
export const ESTADO_VAZIO: EstadoVerbos = { nivelMax: 1, hist: {}, erros: {}, feitas: 0, certas: 0, dias: {} };

export function normalizarEstado(x: unknown): EstadoVerbos {
  const o = (x && typeof x === "object" ? x : {}) as Partial<EstadoVerbos>;
  const nivelMax = Number.isInteger(o.nivelMax) ? Math.min(8, Math.max(1, o.nivelMax as number)) : 1;
  const hist: Record<string, boolean[]> = {};
  for (const [k, v] of Object.entries(o.hist ?? {})) if (Array.isArray(v)) hist[String(Number(k))] = v.slice(-10).map(Boolean);
  const erros: Record<string, RegistroErro> = {};
  for (const [k, e] of Object.entries(o.erros ?? {}).slice(-300)) {
    if (!e || typeof e !== "object" || !VERBOS[(e as RegistroErro).verbo] || !TEMPOS.includes((e as RegistroErro).tempo)) continue;
    const r = e as RegistroErro;
    erros[k] = { verbo: r.verbo, tempo: r.tempo, pessoa: Math.min(5, Math.max(0, Number(r.pessoa) || 0)), errou: String(r.errou ?? "").slice(0, 60), certo: String(r.certo ?? "").slice(0, 60), vezes: Number(r.vezes) || 1, acertos: Number(r.acertos) || 0, data: String(r.data ?? "").slice(0, 10) };
  }
  const dias: Record<string, number> = {};
  for (const [k, v] of Object.entries(o.dias ?? {}).slice(-120)) if (/^\d{4}-\d{2}-\d{2}$/.test(k)) dias[k] = Number(v) || 0;
  return { nivelMax, hist, erros, feitas: Number(o.feitas) || 0, certas: Number(o.certas) || 0, dias };
}

/** Registra uma resposta. Retorna o novo estado e se subiu de nível. */
export function registrar(e: EstadoVerbos, q: Questao, nivel: number, escolha: string, comDica: boolean, hoje: string): { estado: EstadoVerbos; subiu: boolean } {
  const certo = escolha === q.resposta;
  const s: EstadoVerbos = structuredClone(e);
  s.feitas += 1;
  if (certo) s.certas += 1;
  s.dias[hoje] = (s.dias[hoje] ?? 0) + 1;
  const reg = s.erros[q.chave];
  if (!certo) s.erros[q.chave] = { verbo: q.verbo, tempo: q.tempo, pessoa: q.pessoa, errou: escolha, certo: q.resposta, vezes: (reg?.vezes ?? 0) + 1, acertos: 0, data: hoje };
  else if (reg && reg.acertos < 2) reg.acertos += 1;
  let subiu = false;
  if (!comDica) {
    const h = (s.hist[nivel] ?? []).concat(certo).slice(-10);
    s.hist[nivel] = h;
    if (nivel === s.nivelMax && nivel < 8 && h.length >= 10 && h.filter(Boolean).length >= 8) {
      s.nivelMax = nivel + 1;
      subiu = true;
    }
  }
  return { estado: s, subiu };
}

export function pctNivel(e: EstadoVerbos, nivel: number): number | null {
  const h = e.hist[nivel] ?? [];
  return h.length ? Math.round((h.filter(Boolean).length / h.length) * 100) : null;
}

/** Padrão de erro da rodada, em uma frase. */
export function padraoDeErro(erradas: Questao[]): string {
  if (!erradas.length) return "Rodada limpa. Nenhum padrão de erro.";
  const vv = erradas.filter((q) => ["ver", "vir", "prever", "intervir"].includes(q.verbo));
  if (vv.length >= 2 && vv.every((q) => q.pessoa === 5)) return "Você troca o plural de ver e vir. Âncora: “têm, vêm; leem, veem”.";
  if (vv.length >= 2 && vv.every((q) => q.tempo === "fsub")) return "Você troca o futuro do subjuntivo de ver e vir. Âncora: “ver vira vir, vir vira vier”.";
  const conta = (f: (q: Questao) => string) => {
    const m = new Map<string, number>();
    for (const q of erradas) m.set(f(q), (m.get(f(q)) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0];
  };
  const [tempo, nt] = conta((q) => q.tempo);
  const [pessoa, np] = conta((q) => String(q.pessoa));
  if (nt >= 2) return `Seus erros se concentram no ${TEMPO_INFO[tempo as Tempo].nome}. Releia como ele se monta: ${TEMPO_INFO[tempo as Tempo].terminacao || "veja a tabela"}.`;
  if (np >= 2) return `Seus erros se concentram na pessoa “${PESSOAS[Number(pessoa)]}”. Confira o sujeito antes de escolher.`;
  return "Erros espalhados, sem um padrão só. Eles voltam nas próximas rodadas.";
}

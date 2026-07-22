const UNIDADES = [
  "zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
];
const DEZ_A_DEZENOVE = [
  "dez", "onze", "doze", "treze", "quatorze", "quinze",
  "dezesseis", "dezessete", "dezoito", "dezenove",
];
const DEZENAS = [
  "", "", "vinte", "trinta", "quarenta", "cinquenta",
  "sessenta", "setenta", "oitenta", "noventa",
];
const CENTENAS = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];
const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function grupoPorExtenso(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";

  const centena = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];

  if (centena > 0) partes.push(CENTENAS[centena]);

  if (resto >= 10 && resto <= 19) {
    partes.push(DEZ_A_DEZENOVE[resto - 10]);
  } else {
    const dezena = Math.floor(resto / 10);
    const unidade = resto % 10;
    if (dezena > 0) partes.push(DEZENAS[dezena]);
    if (unidade > 0) partes.push(UNIDADES[unidade]);
  }

  return partes.join(" e ");
}

function juntarGrupos(partes: string[], ultimoValor: number): string {
  if (partes.length <= 1) return partes.join("");
  const usaE = ultimoValor < 100 || ultimoValor % 100 === 0;
  if (usaE) {
    return `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`;
  }
  return partes.join(", ");
}

function inteiroPorExtenso(n: number): string {
  if (n === 0) return "zero";

  const milhoes = Math.floor(n / 1_000_000);
  const milhares = Math.floor((n % 1_000_000) / 1000);
  const unidades = n % 1000;

  const partes: string[] = [];
  if (milhoes > 0) {
    partes.push(milhoes === 1 ? "um milhão" : `${grupoPorExtenso(milhoes)} milhões`);
  }
  if (milhares > 0) {
    partes.push(milhares === 1 ? "mil" : `${grupoPorExtenso(milhares)} mil`);
  }
  if (unidades > 0) {
    partes.push(grupoPorExtenso(unidades));
  }

  const ultimoValor = unidades > 0 ? unidades : milhares > 0 ? milhares : milhoes;
  return juntarGrupos(partes, ultimoValor);
}

/** Converte um valor em reais pro texto por extenso (ex.: 4500 -> "quatro mil e quinhentos reais"). */
export function valorPorExtenso(valor: number): string {
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);

  const milhaoExato = reais >= 1_000_000 && reais % 1_000_000 === 0;
  const sufixo = milhaoExato ? "de reais" : reais === 1 ? "real" : "reais";
  const reaisTexto = `${inteiroPorExtenso(reais)} ${sufixo}`;
  if (centavos === 0) return reaisTexto;

  const centavosTexto = `${inteiroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`;
  return `${reaisTexto} e ${centavosTexto}`;
}

/** Converte uma data (string ISO) pro texto por extenso (ex.: "20 de março de 2019"), sempre em UTC. */
export function dataPorExtenso(dateString: string): string {
  const d = new Date(dateString);
  const dia = d.getUTCDate();
  const mes = MESES[d.getUTCMonth()];
  const ano = d.getUTCFullYear();
  return `${dia} de ${mes} de ${ano}`;
}

"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, Check, Lightbulb, Lock, RotateCcw, X } from "lucide-react";
import {
  ESTADO_VAZIO,
  NIVEIS,
  PESSOAS,
  TEMPOS,
  TEMPO_INFO,
  VERBOS,
  explicar,
  miniTabela,
  montarRodada,
  normalizar,
  padraoDeErro,
  pctNivel,
  pedidoConjugacao,
  questaoAcento,
  questaoForma,
  registrar,
  gerarQuestao,
  type ConjugacaoPedido,
  type EstadoVerbos,
  type Questao,
  type QuestaoForma,
} from "@/lib/estudos-verbos";
import { Barra, BOTAO_PRIMARIO, CAMPO, Card, CardTitulo, Kpi } from "@/components/estudos/ui";

type Modo = "frase" | "conjugacao" | "forma" | "acento" | "vos" | "erros" | "tabelas";
const MODOS: { id: Modo; rotulo: string }[] = [
  { id: "frase", rotulo: "Complete a frase" },
  { id: "conjugacao", rotulo: "Conjugação completa" },
  { id: "forma", rotulo: "Que forma é essa?" },
  { id: "acento", rotulo: "Acento" },
  { id: "vos", rotulo: "Vós" },
  { id: "erros", rotulo: "Só meus erros" },
  { id: "tabelas", rotulo: "Tabelas" },
];
const TAMANHO = 7;
const semInscricao = () => () => {};

export function VerbosClient({ inicial, hoje }: { inicial: EstadoVerbos; hoje: string }) {
  const [estado, setEstado] = useState<EstadoVerbos>(inicial ?? ESTADO_VAZIO);
  const [nivelN, setNivelN] = useState(inicial?.nivelMax ?? 1);
  const [modo, setModo] = useState<Modo>("frase");
  const [aviso, setAviso] = useState("");
  const [rodadaId, setRodadaId] = useState(0);
  // As questões são sorteadas; só montamos no navegador para o servidor não sortear outra.
  const pronto = useSyncExternalStore(semInscricao, () => true, () => false);

  const pendentes = Object.values(estado.erros).filter((e) => e.acertos < 2);
  const pct = pctNivel(estado, nivelN);
  const nivel = NIVEIS[nivelN - 1];

  async function salvar(novo: EstadoVerbos) {
    setEstado(novo);
    try {
      const res = await fetch("/api/admin/estudos/verbos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: novo }) });
      if (!res.ok) throw new Error();
      setAviso("");
    } catch {
      setAviso("Não consegui salvar a última resposta. Confira se você ainda está logada.");
    }
  }

  function trocar(m: Modo, n = nivelN) {
    setModo(m);
    setNivelN(n);
    setRodadaId((x) => x + 1);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi rotulo="Nível" valor={`${nivelN} de 8`} detalhe={nivel.titulo.split(":")[0]} />
        <Kpi rotulo="Acerto no nível (últimas 10 sem dica)" valor={pct === null ? "–" : `${pct}%`} detalhe={nivelN < estado.nivelMax ? "nível já vencido" : "sobe com 80%"} tom={pct === null ? undefined : pct >= 80 ? "ok" : pct >= 60 ? "warn" : "bad"} />
        <Kpi rotulo="Erros a revisar" valor={String(pendentes.length)} detalhe={pendentes.length ? "entram nas próximas rodadas" : "nenhum pendente"} tom={pendentes.length ? "bad" : "ok"} />
      </div>

      <nav aria-label="Níveis" className="flex flex-wrap gap-2">
        {NIVEIS.map((n) => {
          const livre = n.n <= estado.nivelMax;
          return (
            <button
              key={n.n}
              type="button"
              disabled={!livre}
              title={n.titulo}
              onClick={() => trocar(modo === "vos" || modo === "tabelas" ? "frase" : modo, n.n)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors duration-150 ${n.n === nivelN ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {!livre && <Lock size={11} aria-hidden="true" />} Nível {n.n}
            </button>
          );
        })}
      </nav>
      <p className="text-xs text-e-dim">{nivel.titulo}</p>

      <nav aria-label="Modos de treino" className="flex flex-wrap gap-2">
        {MODOS.map((m) => (
          <button key={m.id} type="button" onClick={() => trocar(m.id)} aria-pressed={modo === m.id} className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${modo === m.id ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"}`}>
            {m.rotulo}
            {m.id === "erros" && pendentes.length > 0 && ` (${pendentes.length})`}
          </button>
        ))}
      </nav>

      {aviso && <p className="text-sm text-e-bad">{aviso}</p>}

      {!pronto && modo !== "tabelas" && <Card><p className="text-sm text-e-dim">Sorteando as questões…</p></Card>}
      {pronto && (modo === "frase" || modo === "vos" || modo === "acento" || modo === "erros") && (
        <Rodada key={`${modo}-${nivelN}-${rodadaId}`} modo={modo} nivelN={modo === "vos" ? 7 : nivelN} estado={estado} hoje={hoje} onSalvar={salvar} onNova={() => setRodadaId((x) => x + 1)} />
      )}
      {pronto && modo === "conjugacao" && <Conjugacao key={`c-${nivelN}-${rodadaId}`} nivelN={nivelN} estado={estado} hoje={hoje} onSalvar={salvar} onNova={() => setRodadaId((x) => x + 1)} />}
      {pronto && modo === "forma" && <Forma key={`f-${nivelN}-${rodadaId}`} nivelN={nivelN} onNova={() => setRodadaId((x) => x + 1)} />}
      {modo === "tabelas" && <Tabelas />}

      {modo !== "tabelas" && <RegistroErros estado={estado} />}
    </div>
  );
}

// ---------- Rodada de múltipla escolha ----------
function Rodada({ modo, nivelN, estado, hoje, onSalvar, onNova }: { modo: Modo; nivelN: number; estado: EstadoVerbos; hoje: string; onSalvar: (e: EstadoVerbos) => void; onNova: () => void }) {
  const nivel = NIVEIS[nivelN - 1];
  const tamanho = nivelN === 8 && modo === "frase" ? 20 : TAMANHO;
  const [fila, setFila] = useState<Questao[]>(() => {
    if (modo === "acento") return Array.from({ length: TAMANHO }, () => questaoAcento());
    if (modo === "erros") return montarRodada(NIVEIS[7], Object.values(estado.erros), TAMANHO, true);
    return montarRodada(nivel, Object.values(estado.erros), tamanho);
  });
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState("");
  const [usouDica, setUsouDica] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [erradas, setErradas] = useState<Questao[]>([]);
  const [subiu, setSubiu] = useState(false);
  const [inicio] = useState(() => Date.now());
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    if (nivelN !== 8) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [nivelN]);

  if (!fila.length) {
    return (
      <Card>
        <p className="text-sm text-e-dim">Nenhum erro pendente para revisar. Faça uma rodada de “Complete a frase” e os erros aparecem aqui.</p>
      </Card>
    );
  }

  const q = fila[i];
  const fim = i >= fila.length;

  function responder(op: string) {
    if (escolha) return;
    setEscolha(op);
    const certo = op === q.resposta;
    if (certo) setAcertos((a) => a + 1);
    else {
      setErradas((e) => [...e, q]);
      // O mesmo item volta, de outro jeito, dentro de 5 questões.
      const volta = modo === "acento" ? questaoAcento() : gerarQuestao(nivel, { verbo: q.verbo, tempo: q.tempo, pessoa: q.pessoa });
      if (volta && modo !== "acento") setFila((f) => [...f.slice(0, i + 3), volta, ...f.slice(i + 3)]);
    }
    const r = registrar(estado, q, nivelN, op, usouDica, hoje);
    if (r.subiu) setSubiu(true);
    onSalvar(r.estado);
  }

  function proxima() {
    setEscolha("");
    setUsouDica(false);
    setI((x) => x + 1);
  }

  if (fim) {
    const total = fila.length;
    const minutos = Math.round((agora - inicio) / 60000);
    return (
      <Card destaque={erradas.length === 0}>
        <CardTitulo>Fim da rodada</CardTitulo>
        <p className="text-2xl font-medium text-e-ink tabular-nums">
          {acertos} de {total}
        </p>
        {nivelN === 8 && <p className="text-xs text-e-dim">Tempo: {minutos} min</p>}
        <p className="mt-2 text-sm text-e-ink">{padraoDeErro(erradas)}</p>
        {subiu && <p className="mt-2 text-sm text-e-ok">Você acertou 80% sem dica e liberou o nível {nivelN + 1}.</p>}
        {erradas.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-e-dim">
            {erradas.map((x, k) => (
              <li key={k}>
                {x.verbo}, {TEMPO_INFO[x.tempo].nome}, {PESSOAS[x.pessoa]}: <span className="text-e-ink">{x.resposta}</span>
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={onNova} className={`${BOTAO_PRIMARIO} mt-4`}>
          <RotateCcw size={15} aria-hidden="true" /> Nova rodada
        </button>
      </Card>
    );
  }

  const exp = escolha ? explicar(q) : null;
  const tab = escolha ? miniTabela(q) : null;
  const partes = q.frase.split("____");

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-e-dim">
        <span>
          Questão {i + 1} de {fila.length}
          {nivelN === 8 && ` · ${Math.floor((agora - inicio) / 60000)} min`}
        </span>
        <span>
          {acertos} certas
        </span>
      </div>
      <div className="mb-3">
        <Barra pct={(i / fila.length) * 100} tom="accent" />
      </div>

      {nivel.ancora && modo !== "acento" && !escolha && nivelN === 2 && (
        <p className="mb-3 rounded-lg border border-e-line bg-e-card-2 px-3 py-2 text-xs text-e-dim">
          Âncora: cabe “olhar”? É ver. Cabe “chegar”? É vir. “Têm, vêm; leem, veem”. “Ver vira vir, vir vira vier”.
        </p>
      )}

      <p className="mb-1 text-lg text-e-ink">
        {partes[0]}
        <span className={`mx-1 inline-block min-w-16 border-b-2 text-center ${escolha ? (escolha === q.resposta ? "border-e-ok text-e-ok" : "border-e-bad text-e-bad") : "border-e-accent"}`}>{escolha ? q.resposta : " "}</span>
        {partes[1]}
      </p>
      {!escolha && (
        <p className="mb-3 text-xs text-e-dim">
          {usouDica || nivelN === 1 ? (
            <>Dica: {q.dica}</>
          ) : (
            <button type="button" onClick={() => setUsouDica(true)} className="inline-flex items-center gap-1 hover:text-e-ink">
              <Lightbulb size={12} aria-hidden="true" /> Mostrar dica (não conta para subir de nível)
            </button>
          )}
        </p>
      )}

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {q.opcoes.map((op, k) => {
          const letra = "ABCD"[k];
          const certa = escolha && op === q.resposta;
          const errada = escolha === op && op !== q.resposta;
          return (
            <button
              key={op}
              type="button"
              onClick={() => responder(op)}
              disabled={!!escolha}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-150 ${certa ? "border-e-ok bg-e-ok/10 text-e-ok" : errada ? "border-e-bad bg-e-bad/10 text-e-bad" : "border-e-line text-e-ink hover:border-e-accent"}`}
            >
              <span className="text-e-dim">({letra})</span> {op}
              {certa && <Check size={14} className="ml-auto" aria-label="correta" />}
              {errada && <X size={14} className="ml-auto" aria-label="sua resposta" />}
            </button>
          );
        })}
      </div>

      {exp && tab && (
        <div className="mt-4 border-t border-e-line pt-3 text-sm">
          <p className={`font-medium ${escolha === q.resposta ? "text-e-ok" : "text-e-bad"}`}>{escolha === q.resposta ? "Acertou." : `Errou. O certo é “${q.resposta}”.`}</p>
          <p className="mt-1 text-e-ink">{exp.titulo}</p>
          <p className="mt-1 text-e-dim">{exp.pista}</p>
          <p className="mt-1 text-e-ink">{exp.monta}</p>
          {exp.extra.map((x) => (
            <p key={x} className="mt-1 text-e-dim">
              {x}
            </p>
          ))}
          <MiniTabela tempo={TEMPO_INFO[q.tempo].nome} tab={tab} />
          {escolha !== q.resposta && <p className="mt-2 text-xs text-e-dim">Anotado no registro. Volta em até 5 questões e de novo na próxima sessão.</p>}
          <div className="mt-3 text-right">
            <button type="button" onClick={proxima} className={BOTAO_PRIMARIO} autoFocus>
              Próxima <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function MiniTabela({ tempo, tab }: { tempo: string; tab: ReturnType<typeof miniTabela> }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full max-w-md text-xs">
        <caption className="mb-1 text-left text-[11px] uppercase tracking-[0.12em] text-e-dim">{tempo}</caption>
        <thead>
          <tr className="text-e-dim">
            <th className="py-1 pr-3 text-left font-normal" />
            {tab.cabecalho.map((c) => (
              <th key={c} className="py-1 pr-3 text-left font-medium text-e-ink">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tab.linhas.map((l) => (
            <tr key={l.pessoa} className={l.marcada ? "bg-e-accent-soft" : ""}>
              <td className="py-1 pr-3 text-e-dim">{l.pessoa}</td>
              {l.formas.map((f, k) => (
                <td key={k} className={`py-1 pr-3 ${l.marcada && k === 0 ? "font-medium text-e-ink" : "text-e-ink"}`}>
                  {f}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Conjugação completa ----------
function Conjugacao({ nivelN, estado, hoje, onSalvar, onNova }: { nivelN: number; estado: EstadoVerbos; hoje: string; onSalvar: (e: EstadoVerbos) => void; onNova: () => void }) {
  const nivel = NIVEIS[Math.min(nivelN, 6) - 1];
  const [pedido] = useState<ConjugacaoPedido>(() => pedidoConjugacao(nivel));
  const [resp, setResp] = useState<string[]>(["", "", "", "", "", ""]);
  const [conferido, setConferido] = useState(false);
  const [erro, setErro] = useState("");
  const certas = VERBOS[pedido.verbo].tempos[pedido.tempo];

  function conferir() {
    if (resp.some((r) => !r.trim())) {
      setErro("Preencha as seis formas antes de conferir.");
      return;
    }
    setErro("");
    setConferido(true);
    let e = estado;
    resp.forEach((r, p) => {
      const q: Questao = { id: "", chave: `${pedido.verbo}|${pedido.tempo}|${p}`, verbo: pedido.verbo, tempo: pedido.tempo, pessoa: p, frase: "", sujeito: "", dica: "", resposta: certas[p], opcoes: [] };
      e = registrar(e, q, nivelN, normalizar(r) === certas[p] ? certas[p] : normalizar(r), true, hoje).estado;
    });
    onSalvar(e);
  }

  const nAcertos = resp.filter((r, p) => normalizar(r) === certas[p]).length;
  return (
    <Card>
      <CardTitulo>
        {pedido.verbo.toUpperCase()}, {TEMPO_INFO[pedido.tempo].nome}
      </CardTitulo>
      <p className="mb-3 text-xs text-e-dim">
        Escreva as seis formas. Acento conta. Pista: {TEMPO_INFO[pedido.tempo].pista}.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {PESSOAS.map((p, k) => {
          const ok = normalizar(resp[k]) === certas[k];
          return (
            <label key={p} className="text-xs text-e-dim">
              {p}
              <input
                value={resp[k]}
                disabled={conferido}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => {
                  setErro("");
                  setResp((r) => r.map((x, j) => (j === k ? e.target.value : x)));
                }}
                className={`${CAMPO} ${conferido ? (ok ? "border-e-ok" : "border-e-bad") : ""}`}
              />
              {conferido && !ok && <span className="mt-0.5 block text-e-bad">certo: {certas[k]}</span>}
            </label>
          );
        })}
      </div>
      {erro && <p className="mt-2 text-sm text-e-bad">{erro}</p>}
      {!conferido ? (
        <button type="button" onClick={conferir} className={`${BOTAO_PRIMARIO} mt-4`}>
          Conferir
        </button>
      ) : (
        <div className="mt-4 text-sm">
          <p className="text-e-ink">
            {nAcertos} de 6 certas. Como se monta: {TEMPO_INFO[pedido.tempo].terminacao || "veja as terminações na tabela"}.
          </p>
          {VERBOS[pedido.verbo].base && <p className="mt-1 text-e-dim">Derivado: copia o {VERBOS[pedido.verbo].base}.</p>}
          <button type="button" onClick={onNova} className={`${BOTAO_PRIMARIO} mt-3`}>
            Outro verbo <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      )}
    </Card>
  );
}

// ---------- Que forma é essa? ----------
function Forma({ nivelN, onNova }: { nivelN: number; onNova: () => void }) {
  const nivel = NIVEIS[Math.min(nivelN, 7) - 1];
  const [q] = useState<QuestaoForma>(() => questaoForma(nivel));
  const [escolha, setEscolha] = useState("");
  return (
    <Card>
      <CardTitulo>Que forma é essa?</CardTitulo>
      <p className="mb-3 text-2xl font-medium text-e-ink">{q.forma}</p>
      <div className="grid gap-2">
        {q.opcoes.map((op) => {
          const certa = escolha && q.certas.includes(op);
          const errada = escolha === op && !q.certas.includes(op);
          return (
            <button key={op} type="button" disabled={!!escolha} onClick={() => setEscolha(op)} className={`rounded-lg border px-3 py-2 text-left text-sm ${certa ? "border-e-ok text-e-ok" : errada ? "border-e-bad text-e-bad" : "border-e-line text-e-ink hover:border-e-accent"}`}>
              {op}
            </button>
          );
        })}
      </div>
      {escolha && (
        <div className="mt-3 text-sm">
          <p className="text-e-ink">{q.certas.length > 1 ? `“${q.forma}” pode ser mais de uma coisa. O contexto decide:` : `“${q.forma}” é:`}</p>
          <ul className="mt-1 list-disc pl-5 text-e-dim">
            {q.certas.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <button type="button" onClick={onNova} className={`${BOTAO_PRIMARIO} mt-3`}>
            Próxima <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      )}
    </Card>
  );
}

// ---------- Tabelas ----------
function Tabelas() {
  const nomes = useMemo(() => Object.keys(VERBOS), []);
  const [v, setV] = useState("ver");
  const verbo = VERBOS[v];
  return (
    <Card>
      <CardTitulo
        acao={
          <select aria-label="Verbo" value={v} onChange={(e) => setV(e.target.value)} className="rounded-lg border border-e-line bg-e-card-2 px-2.5 py-1.5 text-sm text-e-ink outline-none focus:border-e-accent">
            {nomes.map((n) => (
              <option key={n} value={n}>
                {n}
                {VERBOS[n].regular ? " (regular)" : ""}
              </option>
            ))}
          </select>
        }
      >
        Tabela de {v.toUpperCase()}
      </CardTitulo>
      <p className="mb-3 text-xs text-e-dim">
        {verbo.regular ? "Regular: o começo não muda, só a terminação." : verbo.base ? `Derivado: conjuga igual a ${verbo.base}.` : "Irregular: o começo muda em alguns tempos."} Particípio: {verbo.participio}. Gerúndio: {verbo.gerundio}.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-xs">
          <thead>
            <tr className="text-e-dim">
              <th className="py-1 pr-3 text-left font-normal">Tempo</th>
              {PESSOAS.map((p) => (
                <th key={p} className="py-1 pr-3 text-left font-normal">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEMPOS.map((t) => (
              <tr key={t} className="border-t border-e-line">
                <td className="py-1.5 pr-3 text-e-dim">{TEMPO_INFO[t].nome}</td>
                {verbo.tempos[t].map((f, k) => (
                  <td key={k} className="py-1.5 pr-3 text-e-ink">
                    {f || <span className="text-e-dim">não existe</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 space-y-1 text-xs text-e-dim">
        {TEMPOS.filter((t) => TEMPO_INFO[t].terminacao).map((t) => (
          <p key={t}>
            <span className="text-e-ink">{TEMPO_INFO[t].nome}:</span> {TEMPO_INFO[t].terminacao}.
          </p>
        ))}
      </div>
    </Card>
  );
}

// ---------- Registro de erros ----------
function RegistroErros({ estado }: { estado: EstadoVerbos }) {
  const lista = Object.values(estado.erros).sort((a, b) => a.acertos - b.acertos || b.data.localeCompare(a.data)).slice(0, 30);
  if (!lista.length) return null;
  return (
    <Card>
      <CardTitulo acao={<span className="text-xs text-e-dim">sai da lista depois de 2 acertos</span>}>Registro de erros</CardTitulo>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-e-dim">
              <th className="py-1 pr-3 text-left font-normal">Verbo, tempo e pessoa</th>
              <th className="py-1 pr-3 text-left font-normal">Você pôs</th>
              <th className="py-1 pr-3 text-left font-normal">Certo</th>
              <th className="py-1 text-left font-normal">Revisão</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((e) => (
              <tr key={`${e.verbo}|${e.tempo}|${e.pessoa}`} className="border-t border-e-line">
                <td className="py-1.5 pr-3 text-e-ink">
                  {e.verbo}, {TEMPO_INFO[e.tempo].nome}, {PESSOAS[e.pessoa]}
                </td>
                <td className="py-1.5 pr-3 text-e-bad">{e.errou}</td>
                <td className="py-1.5 pr-3 text-e-ok">{e.certo}</td>
                <td className={`py-1.5 ${e.acertos >= 2 ? "text-e-ok" : "text-e-warn"}`}>{e.acertos >= 2 ? "aprendido" : e.acertos === 1 ? "acertou 1 vez" : `pendente (errou ${e.vezes}x)`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

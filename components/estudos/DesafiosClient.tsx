"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { DESAFIOS_POR_DIA, type Correcao, type DesafioAberto } from "@/lib/estudos-desafios";
import { Sparkle } from "@/components/estudos/Sparkle";
import { Barra, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Card, CardTitulo, Kpi } from "@/components/estudos/ui";

interface Props {
  desafios: DesafioAberto[];
  materias: { id: string; nome: string }[];
  materia: string;
  rodada: number;
  hojeFeitos: number;
  hojeAcertos: number;
  sequencia: number;
  recorde: number;
  total: number;
  vistos: number;
}

/** Mostra o texto com a lacuna destacada. */
function TextoLei({ texto }: { texto: string }) {
  const partes = texto.split("_____");
  return (
    <p className="font-serif text-[15px] leading-relaxed text-e-ink">
      {partes.map((p, i) => (
        <span key={i}>
          {p}
          {i < partes.length - 1 && <span className="mx-1 inline-block min-w-16 border-b-2 border-e-accent align-baseline">&nbsp;</span>}
        </span>
      ))}
    </p>
  );
}

export function DesafiosClient(p: Props) {
  const [i, setI] = useState(0);
  const [correcao, setCorrecao] = useState<Correcao | null>(null);
  const [escolha, setEscolha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [feitos, setFeitos] = useState(p.hojeFeitos);
  const [acertos, setAcertos] = useState(p.hojeAcertos);
  const [rodadaOk, setRodadaOk] = useState(0);

  const atual = p.desafios[i];
  const fimRodada = i >= p.desafios.length;
  // A sequência do dia conta quando os 10 de hoje fecham (pode ser em mais de uma rodada).
  const seq = p.sequencia + (p.hojeFeitos < DESAFIOS_POR_DIA && feitos >= DESAFIOS_POR_DIA ? 1 : 0);
  const filtro = (m: string) => `/admin/estudos/desafios${m ? `?materia=${m}` : ""}`;

  async function responder(resposta: string) {
    if (!atual || correcao || salvando) return;
    setEscolha(resposta);
    setSalvando(true);
    setErro("");
    try {
      const res = await fetch("/api/admin/estudos/desafios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: atual.id, resposta }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro");
      const c = json.correcao as Correcao;
      setCorrecao(c);
      setFeitos((f) => f + 1);
      if (c.ok) {
        setAcertos((a) => a + 1);
        setRodadaOk((a) => a + 1);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar");
      setEscolha("");
    } finally {
      setSalvando(false);
    }
  }

  function proximo() {
    setCorrecao(null);
    setEscolha("");
    setI((n) => n + 1);
  }

  const corBotao = (valor: string) => {
    if (!correcao) return BOTAO_SECUNDARIO + " text-sm";
    const certo = correcao.resposta === valor || correcao.resposta.toLowerCase() === valor;
    if (certo) return BOTAO_SECUNDARIO + " text-sm border-e-ok text-e-ok";
    if (valor === escolha) return BOTAO_SECUNDARIO + " text-sm border-e-bad text-e-bad";
    return BOTAO_SECUNDARIO + " text-sm opacity-60";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi
          rotulo="Sequência"
          valor={`${seq} ${seq === 1 ? "dia" : "dias"}`}
          detalhe={feitos >= DESAFIOS_POR_DIA ? "Hoje já conta" : `Faltam ${DESAFIOS_POR_DIA - feitos} hoje`}
          tom={feitos >= DESAFIOS_POR_DIA ? "ok" : "warn"}
        />
        <Kpi rotulo="Recorde" valor={`${Math.max(p.recorde, seq)} dias`} />
        <Kpi rotulo="Hoje" valor={`${acertos}/${feitos}`} detalhe="acertos / respondidos" />
        <Kpi rotulo="Banco visto" valor={`${p.vistos}/${p.total}`} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={filtro("")} className={`${BOTAO_SECUNDARIO} ${!p.materia ? "border-e-accent text-e-ink" : ""}`}>
          Todas
        </Link>
        {p.materias.map((m) => (
          <Link key={m.id} href={filtro(m.id)} className={`${BOTAO_SECUNDARIO} ${p.materia === m.id ? "border-e-accent text-e-ink" : ""}`}>
            {m.nome}
          </Link>
        ))}
      </div>

      {fimRodada ? (
        <Card destaque>
          <p className="flex items-center gap-2 text-sm text-e-ink">
            <Sparkle size={16} variante="brilhante" /> Rodada fechada: {rodadaOk} de {p.desafios.length}.
          </p>
          {feitos >= DESAFIOS_POR_DIA && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-e-ok">
              <Flame size={14} aria-hidden="true" /> Sequência do dia garantida.
            </p>
          )}
          <p className="mt-2 text-xs text-e-dim">Os que você errou voltam nas próximas rodadas.</p>
          <Link
            href={`/admin/estudos/desafios?r=${p.rodada + 1}${p.materia ? `&materia=${p.materia}` : ""}`}
            className={`mt-4 ${BOTAO_PRIMARIO}`}
          >
            Mais {DESAFIOS_POR_DIA}
          </Link>
        </Card>
      ) : atual ? (
        <Card>
          <CardTitulo acao={<span className="text-xs text-e-dim">{i + 1} de {p.desafios.length}</span>}>
            {atual.tipo === "lacuna" ? "Complete a lacuna" : "Certo ou errado? (texto pode ter troca de palavra)"}
          </CardTitulo>
          <div className="mb-3">
            <Barra pct={(i / p.desafios.length) * 100} />
          </div>
          <p className="mb-2 text-xs text-e-dim">{atual.ref}</p>
          {atual.contexto && <p className="mb-2 text-xs italic text-e-dim">{atual.contexto}</p>}
          <TextoLei texto={atual.texto} />

          <div className="mt-4 flex flex-wrap gap-2">
            {atual.tipo === "lacuna"
              ? atual.opcoes.map((o) => (
                  <button key={o} type="button" disabled={!!correcao || salvando} onClick={() => responder(o)} className={corBotao(o)}>
                    {o}
                  </button>
                ))
              : (["certo", "errado"] as const).map((o) => (
                  <button key={o} type="button" disabled={!!correcao || salvando} onClick={() => responder(o)} className={corBotao(o)}>
                    {o === "certo" ? "Certo" : "Errado"}
                  </button>
                ))}
          </div>
          {erro && <p className="mt-2 text-xs text-e-bad">{erro}</p>}

          {correcao && (
            <div className="mt-4 rounded-xl border border-e-line bg-e-card-2 p-3">
              <p className={`text-sm font-medium ${correcao.ok ? "text-e-ok" : "text-e-bad"}`}>
                {correcao.ok ? "Acertou." : "Errou."} {correcao.explicacao}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-e-dim">Texto literal</p>
              <p className="mt-1 font-serif text-sm leading-relaxed text-e-ink">{correcao.literal}</p>
              {correcao.juris.length > 0 && (
                <>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-e-dim">Jurisprudência ligada</p>
                  {correcao.juris.map((j) => (
                    <p key={j.fonte} className="mt-1 text-sm text-e-ink">
                      {j.texto} <span className="text-xs text-e-dim">({j.fonte}, {j.data})</span>
                    </p>
                  ))}
                </>
              )}
              <button type="button" onClick={proximo} className={`mt-3 ${BOTAO_PRIMARIO}`}>
                Próximo
              </button>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-e-dim">Sem desafios para este filtro.</p>
        </Card>
      )}
    </div>
  );
}

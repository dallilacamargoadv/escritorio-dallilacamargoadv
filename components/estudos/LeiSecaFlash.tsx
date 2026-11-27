"use client";

import { useState, type ReactNode } from "react";
import type { TreinoLei } from "@/lib/estudos-lei-flash";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO } from "@/components/estudos/ui";

const LEI = "font-serif text-[15px] leading-relaxed text-e-ink [&_mark]:rounded [&_mark]:bg-e-accent-soft [&_mark]:px-0.5 [&_mark]:text-e-ink";

/** Treino rápido do artigo: um item por vez, responde e vê o texto literal. */
function Treino({ itens }: { itens: TreinoLei[] }) {
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);
  if (i >= itens.length)
    return (
      <p className="mt-2 text-sm text-e-dim">
        Treino feito: {acertos} de {itens.length} certas.{" "}
        <button type="button" className="underline" onClick={() => (setI(0), setAcertos(0), setEscolha(null))}>
          Fazer de novo
        </button>
      </p>
    );
  const it = itens[i];
  const ok = escolha === it.resposta;
  return (
    <div className="mt-2 rounded-xl border border-e-line bg-e-bg p-3 text-sm">
      <p className="text-[11px] text-e-dim">
        {i + 1} de {itens.length} · {it.tipo === "ce" ? "Certo ou errado" : "Complete a lacuna"} · {it.ref}
      </p>
      <p className="mt-1 leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: it.texto }} />
      <div className="mt-2 flex flex-wrap gap-2">
        {it.opcoes.map((o) => {
          const marca = escolha === null ? "" : o === it.resposta ? "border-e-ok text-e-ok" : o === escolha ? "border-e-bad text-e-bad" : "opacity-60";
          return (
            <button
              key={o}
              type="button"
              disabled={escolha !== null}
              onClick={() => (setEscolha(o), o === it.resposta && setAcertos((n) => n + 1))}
              className={`${BOTAO_SECUNDARIO} ${marca}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {escolha !== null && (
        <>
          <p className={`mt-2 text-xs ${ok ? "text-e-ok" : "text-e-bad"}`}>{ok ? "Isso." : `Não. Resposta: ${it.resposta}.`} Texto da lei:</p>
          <p className={`mt-1 border-l-2 border-e-blue/60 pl-3 ${LEI}`} dangerouslySetInnerHTML={{ __html: it.literal }} />
          <button type="button" onClick={() => (setI(i + 1), setEscolha(null))} className={`mt-2 ${BOTAO_PRIMARIO}`}>
            {i + 1 < itens.length ? "Próximo" : "Terminar"}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Lei seca como flashcard: frente = a referência (lembre o que o artigo diz), verso = o texto vigente
 * com o trecho do erro grifado, depois o treino em certo/errado ou lacuna. `rodape` recebe os botões da fila.
 */
export function LeiSecaFlash({
  refLei,
  detalhe,
  html,
  treino,
  rodape,
  abertoInicial = false,
}: {
  refLei: string;
  detalhe: string;
  html: string;
  treino: TreinoLei[];
  rodape?: ReactNode;
  abertoInicial?: boolean;
}) {
  const [aberto, setAberto] = useState(abertoInicial);
  const [virado, setVirado] = useState(false);
  const [treinando, setTreinando] = useState(false);
  return (
    <div className="rounded-xl border border-e-line bg-e-card-2">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        className="flex w-full flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-sm text-e-ink">{refLei}</span>
        <span className="text-[11px] text-e-dim">{detalhe}</span>
      </button>
      {aberto && (
        <div className="border-t border-e-line px-4 py-3">
          {!virado ? (
            <>
              <p className="text-sm text-e-ink">O que diz o {refLei}? Lembre de cabeça (prazo, verbo, quem decide) antes de virar.</p>
              <button type="button" onClick={() => setVirado(true)} className={`mt-3 ${BOTAO_PRIMARIO}`}>
                Mostrar o artigo
              </button>
            </>
          ) : (
            <>
              <p className="text-[11px] text-e-dim">Texto vigente. O trecho grifado foi o ponto do seu erro.</p>
              <div className={`mt-2 ${LEI}`} dangerouslySetInnerHTML={{ __html: html }} />
              {treino.length > 0 &&
                (treinando ? (
                  <Treino itens={treino} />
                ) : (
                  <button type="button" onClick={() => setTreinando(true)} className={`mt-3 ${BOTAO_SECUNDARIO}`}>
                    Treinar este artigo ({treino.length} em certo ou errado e lacuna)
                  </button>
                ))}
              {rodape}
            </>
          )}
        </div>
      )}
    </div>
  );
}

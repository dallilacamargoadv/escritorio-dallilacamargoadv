"use client";

import { useState, type ReactNode } from "react";
import { BOTAO_PRIMARIO } from "@/components/estudos/ui";

const LEI = "font-serif text-[15px] leading-relaxed text-e-ink [&_mark]:rounded [&_mark]:bg-e-accent-soft [&_mark]:px-0.5 [&_mark]:text-e-ink";

/**
 * Lei seca como flashcard: frente = a referência (lembre o que o artigo diz), verso = o texto vigente
 * com o trecho do erro grifado. Só lei seca, sem certo/errado depois (pedido dela, 27/11: lendo antes, acerta sem pensar).
 * `rodape` recebe os botões da fila.
 */
export function LeiSecaFlash({
  refLei,
  detalhe,
  html,
  rodape,
  abertoInicial = false,
}: {
  refLei: string;
  detalhe: string;
  html: string;
  rodape?: ReactNode;
  abertoInicial?: boolean;
}) {
  const [aberto, setAberto] = useState(abertoInicial);
  const [virado, setVirado] = useState(false);
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
              {rodape}
            </>
          )}
        </div>
      )}
    </div>
  );
}

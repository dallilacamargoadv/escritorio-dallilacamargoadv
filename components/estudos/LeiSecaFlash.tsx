"use client";

import { useState, type ReactNode } from "react";
import type { CertoErradoLei } from "@/lib/estudos-lei-flash";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO } from "@/components/estudos/ui";

const LEI = "font-serif text-[15px] leading-relaxed text-e-ink [&_mark]:rounded [&_mark]:bg-e-accent-soft [&_mark]:px-0.5 [&_mark]:text-e-ink";

/**
 * Lei seca como flashcard de certo ou errado (pedido dela, 27/11). O cartão abre com o texto do dispositivo
 * (às vezes com uma palavra trocada) e pergunta: certo ou errado? O texto verdadeiro só aparece depois de responder.
 * Nunca mostra o artigo antes da pergunta. Sem itens no banco para o artigo, fica lembrar de cabeça → virar.
 * `rodape` recebe os botões da fila.
 */
export function LeiSecaFlash({
  refLei,
  detalhe,
  html,
  itens,
  rodape,
  abertoInicial = false,
}: {
  refLei: string;
  detalhe: string;
  html: string;
  itens: CertoErradoLei[];
  rodape?: ReactNode;
  abertoInicial?: boolean;
}) {
  const [aberto, setAberto] = useState(abertoInicial);
  const [i, setI] = useState(0);
  const [resposta, setResposta] = useState<boolean | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [virado, setVirado] = useState(false);
  const it = itens[i];
  const terminou = itens.length > 0 && i >= itens.length;

  function responder(certo: boolean) {
    setResposta(certo);
    if (certo === it.certo) setAcertos((n) => n + 1);
  }

  return (
    <div className="rounded-xl border border-e-line bg-e-card-2">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        className="flex w-full flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-sm text-e-ink">{refLei}</span>
        <span className="text-[11px] text-e-dim">
          {detalhe}
          {itens.length ? ` · ${itens.length} certo ou errado` : ""}
        </span>
      </button>
      {aberto && (
        <div className="border-t border-e-line px-4 py-3">
          {itens.length > 0 && !terminou ? (
            <>
              <p className="text-[11px] text-e-dim">
                {i + 1} de {itens.length} · {it.ref} · Certo ou errado?
              </p>
              <div className={`mt-2 ${LEI}`} dangerouslySetInnerHTML={{ __html: it.texto }} />
              {resposta === null ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => responder(true)} className={BOTAO_SECUNDARIO}>
                    Certo
                  </button>
                  <button type="button" onClick={() => responder(false)} className={BOTAO_SECUNDARIO}>
                    Errado
                  </button>
                </div>
              ) : (
                <>
                  <p className={`mt-3 text-sm ${resposta === it.certo ? "text-e-ok" : "text-e-bad"}`}>
                    {resposta === it.certo ? "Isso." : "Não."} O texto está {it.certo ? "certo" : "errado"}.{" "}
                    {it.certo ? "É a redação da lei." : "O grifo mostra a palavra verdadeira:"}
                  </p>
                  {!it.certo && <div className={`mt-1 border-l-2 border-e-blue/60 pl-3 ${LEI}`} dangerouslySetInnerHTML={{ __html: it.literal }} />}
                  <button type="button" onClick={() => (setI(i + 1), setResposta(null))} className={`mt-3 ${BOTAO_PRIMARIO}`}>
                    {i + 1 < itens.length ? "Próximo" : "Terminar"}
                  </button>
                </>
              )}
            </>
          ) : itens.length === 0 && !virado ? (
            <>
              <p className="text-sm text-e-ink">Ainda não há certo ou errado deste artigo no banco. O que diz o {refLei}? Lembre de cabeça antes de virar.</p>
              <button type="button" onClick={() => setVirado(true)} className={`mt-3 ${BOTAO_PRIMARIO}`}>
                Mostrar o artigo
              </button>
            </>
          ) : (
            <>
              {terminou && (
                <p className="text-sm text-e-ink">
                  {acertos} de {itens.length} certas.{" "}
                  <button type="button" className="text-e-dim underline" onClick={() => (setI(0), setAcertos(0), setResposta(null))}>
                    Fazer de novo
                  </button>
                </p>
              )}
              <details className="mt-2" open={itens.length === 0}>
                <summary className="cursor-pointer text-xs text-e-dim">Ler o artigo inteiro (com o grifo do seu erro)</summary>
                <div className={`mt-2 ${LEI}`} dangerouslySetInnerHTML={{ __html: html }} />
              </details>
              {rodape}
            </>
          )}
        </div>
      )}
    </div>
  );
}

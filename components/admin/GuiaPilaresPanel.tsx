"use client";

import { useState } from "react";

const PILARES = [
  {
    nome: "Topo de funil",
    cor: "border-l-chart-6",
    objetivo: "Atrair quem ainda não te conhece",
    emocao: "Identificação — “isso aconteceu comigo”",
    funciona: "Dores/erros do dia a dia, curiosidade, cultura pop, situação cotidiana com consequência jurídica — sem juridiquês, gancho forte logo de cara.",
    formato: "Reels performa melhor aqui — é o formato que o Instagram entrega pra quem ainda não te segue.",
    exemplos: "Seus exemplos reais: “Séries e filmes que me inspiraram”, “Verdades duras com fotos fofinhas”.",
  },
  {
    nome: "Meio de funil",
    cor: "border-l-chart-1",
    objetivo: "Construir confiança e autoridade",
    emocao: "Clareza — “agora eu entendo”",
    funciona: "Explicações, passo a passo, bastidores, “como funciona na prática” — aqui você mostra que entende do assunto.",
    formato: "Feed, Carrossel e Stories funcionam bem — é conteúdo pra quem já te segue.",
    exemplos: "Seus exemplos reais: “Como não ser banida no WhatsApp Business”, “Identificando o que não é um bom contrato digital”.",
  },
  {
    nome: "Fundo de funil",
    cor: "border-l-chart-5",
    objetivo: "Converter quem já confia",
    emocao: "Segurança — “essa pessoa pode me ajudar”",
    funciona: "Transparência, bastidores pessoais, convite sutil pro próximo passo. Nunca depoimento, prova social ou resultado de caso — vedado pela OAB mesmo anonimizado.",
    formato: "Reels/vídeo mais longo ou Stories com sequência funcionam bem — CTA sempre implícito, nunca “me contrate”.",
    exemplos: "Seus exemplos reais: “Minha história com a Advocacia”, “Oi, eu sou Dallila”.",
  },
];

export function GuiaPilaresPanel() {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="mt-6 border border-hairline-strong">
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="font-display text-base italic text-ink">
          Guia de pilares — o que postar em cada etapa
        </span>
        <span className={`text-ink-dim transition-transform ${aberto ? "rotate-90" : ""}`}>›</span>
      </button>

      {aberto && (
        <div className="border-t border-hairline px-5 pb-5 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PILARES.map((p) => (
              <div key={p.nome} className={`border-l-2 bg-bg-alt p-4 ${p.cor}`}>
                <h4 className="font-display text-sm italic text-ink">{p.nome}</h4>
                <dl className="mt-2 space-y-2 text-xs text-ink-dim">
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-wide">Objetivo</dt>
                    <dd className="mt-0.5">{p.objetivo}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-wide">Emoção-alvo</dt>
                    <dd className="mt-0.5">{p.emocao}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-wide">O que funciona</dt>
                    <dd className="mt-0.5">{p.funciona}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-wide">Formato</dt>
                    <dd className="mt-0.5">{p.formato}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-wide">Exemplo seu</dt>
                    <dd className="mt-0.5 italic">{p.exemplos}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-ink-dim">
            <strong className="text-ink">Regra de ouro:</strong> intercala — não empilha 3 do
            mesmo pilar seguidos. Mantém as três etapas em proporção equilibrada ao longo do mês.
          </p>

          <div className="mt-4 border border-hairline bg-bg-alt p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-wine">Ritmo semanal sugerido</p>
            <p className="mt-1.5 text-xs text-ink-dim">
              <strong className="text-ink">Segunda a quinta:</strong> os 4 conteúdos principais da
              semana (2 topo, 1 meio, 1 fundo — intercalados, não em bloco).{" "}
              <strong className="text-ink">Sexta a domingo:</strong> só Stories leves; um dos dias
              de fim de semana ganha 1 conteúdo de trend ou algo mais pessoal.
            </p>
          </div>

          <div className="mt-3 border border-hairline bg-bg-alt p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-wine">Lembrete OAB antes de publicar</p>
            <p className="mt-1.5 text-xs text-ink-dim">
              Informativo, discreto, sem prometer resultado, sem comparar com outro(a)
              advogado(a), sem “consulta grátis”. No fundo de funil especialmente: nunca
              depoimento ou caso real, mesmo anônimo — só convite sutil.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

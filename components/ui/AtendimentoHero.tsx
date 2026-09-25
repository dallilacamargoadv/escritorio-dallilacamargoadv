import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Bloco de abertura "atendimento" (25/09/2026): fundo dominante troca por
 * tema — borgonha no escuro com destaque azul, azul-bebê no claro com
 * destaque em borgonha. Marrom não entra aqui, nem em detalhe.
 */
export function AtendimentoHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-atendimento-bg">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <p className="font-eyebrow text-xs italic text-atendimento-accent sm:text-sm">
            [ {eyebrow} ]
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl text-[var(--brand-marfim-rosado)] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-atendimento-body">
            {description}
          </p>
          {children}
        </Reveal>
      </div>
    </section>
  );
}

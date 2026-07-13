import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { EnclosureNested } from "@/components/ui/EnclosureNested";
import { JsonLd } from "@/components/JsonLd";
import { ContaHackeadaForm } from "@/components/forms/ContaHackeadaForm";
import type { IconName } from "@/components/ui/Icon";
import {
  BASE_URL,
  getBreadcrumbSchema,
  getServiceSchema,
  jsonLdGraph,
} from "@/lib/schema";

const SLUG = "recuperacao-e-reativacao-de-conta-hackeada";
const PAGE_URL = `${BASE_URL}/${SLUG}`;

export const metadata: Metadata = {
  title: "Conta Hackeada",
  description:
    "Assessoria jurídica para vítimas de conta hackeada, bloqueada ou vítimas de golpes digitais, com atuação em recuperação de acesso e preservação de provas.",
  alternates: { canonical: `/${SLUG}` },
};

const CARDS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "acesso",
    title: "Conta Hackeada",
    description:
      "Atuação jurídica em casos de invasão, acesso indevido e comprometimento de contas em plataformas digitais.",
  },
  {
    icon: "bloqueio",
    title: "Conta Bloqueada",
    description:
      "Assessoria em situações de suspensão, bloqueio ou restrição de acesso por plataformas digitais.",
  },
  {
    icon: "alerta",
    title: "Golpes Digitais",
    description:
      "Orientação e medidas jurídicas relacionadas a fraudes praticadas por meio de contas, perfis ou aplicativos.",
  },
  {
    icon: "defesa",
    title: "Preservação de Provas",
    description:
      "Organização e análise de evidências digitais para subsidiar medidas extrajudiciais ou judiciais, quando cabíveis.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Formulário curto",
    description: "Preenchimento de formulário curto, com um breve relato da situação.",
  },
  {
    number: "02",
    title: "Agendamento",
    description: "Agendamento de uma conversa para entendimento do caso.",
  },
  {
    number: "03",
    title: "Início do atendimento",
    description: "Início do atendimento, com alinhamento via WhatsApp comercial.",
  },
];

export default function ContaHackeadaPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          getServiceSchema({
            name: "Recuperação e Reativação de Conta Hackeada",
            description:
              "Atuação jurídica para vítimas de invasão, bloqueio ou uso indevido de contas em redes sociais, e-mail e outras plataformas digitais.",
            url: PAGE_URL,
          }),
          getBreadcrumbSchema([
            { name: "Home", url: BASE_URL },
            {
              name: "Recuperação e Reativação de Conta Hackeada",
              url: PAGE_URL,
            },
          ]),
        ])}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        <Reveal>
          <h1 className="max-w-3xl text-4xl sm:text-6xl">
            <em className="italic text-gold">Conta Hackeada</em> com
            recuperação de acesso e resposta jurídica estruturada.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-dim">
            Atuação jurídica para vítimas de invasão, bloqueio ou uso indevido
            de contas em redes sociais, e-mail e outras plataformas digitais,
            com foco em recuperação de acesso.
          </p>
          <div className="mt-8">
            <Button href="#formulario">Iniciar atendimento</Button>
          </div>
        </Reveal>
      </section>

      {/* O Que Fazemos */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionEyebrow>O Que Fazemos</SectionEyebrow>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((card, index) => (
              <FeatureCard
                key={card.title}
                icon={card.icon}
                number={String(index + 1).padStart(2, "0")}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Como Funciona */}
      <section className="border-t border-hairline bg-bg-alt">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <SectionEyebrow>Como Funciona</SectionEyebrow>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number}>
                  <span className="font-mono text-2xl text-gold tabular-nums">
                    {step.number}
                  </span>
                  <h3 className="mt-3 text-lg">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Nota técnica */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <EnclosureNested className="max-w-3xl">
            <p className="font-eyebrow text-[10px] text-gold">Nota técnica</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim">
              Casos de acesso indevido a contas digitais também podem
              envolver aspectos disciplinados pelo Marco Civil da Internet,
              que estabelece direitos e deveres para o uso da internet no
              Brasil.
            </p>
            <a
              href="https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-gold underline"
            >
              Fonte: Marco Civil da Internet, Lei nº 12.965/2014
            </a>
          </EnclosureNested>
        </Reveal>
      </section>

      {/* Formulário */}
      <section
        id="formulario"
        className="scroll-mt-20 border-t border-hairline bg-bg-alt"
      >
        <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
          <Reveal>
            <SectionEyebrow>Iniciar Atendimento</SectionEyebrow>
            <ContaHackeadaForm />
          </Reveal>
        </div>
      </section>

      {/* Fechamento */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <Reveal className="flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl">
              Precisa de suporte jurídico para recuperar o acesso a uma conta
              comprometida?
            </h2>
            <div className="mt-8">
              <Button href="#formulario">Iniciar atendimento</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

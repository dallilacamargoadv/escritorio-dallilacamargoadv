import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { EnclosureNested } from "@/components/ui/EnclosureNested";
import { JsonLd } from "@/components/JsonLd";
import { ContratosForm } from "@/components/forms/ContratosForm";
import type { IconName } from "@/components/ui/Icon";
import {
  BASE_URL,
  getBreadcrumbSchema,
  getServiceSchema,
  jsonLdGraph,
} from "@/lib/schema";

const SLUG = "contratos";
const PAGE_URL = `${BASE_URL}/${SLUG}`;

export const metadata: Metadata = {
  title: "Contratos Digitais",
  description:
    "Elaboração, revisão e negociação de contratos para criadores de conteúdo, influenciadores e negócios digitais, com atenção a cláusulas, riscos e conformidade.",
  alternates: { canonical: `/${SLUG}` },
};

const CARDS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "contrato",
    title: "Contratos de Prestação",
    description:
      "Elaboração e revisão de contratos para prestadores de serviços, profissionais autônomos e negócios digitais.",
  },
  {
    icon: "parceria",
    title: "Parcerias Comerciais",
    description:
      "Instrumentos jurídicos para colaborações, coproduções, patrocínios e demais relações negociais.",
  },
  {
    icon: "digital",
    title: "Influenciadores Digitais",
    description:
      "Contratos para campanhas publicitárias, publicidade, licenciamento de imagem e produção de conteúdo.",
  },
  {
    icon: "processo",
    title: "Revisão Contratual",
    description:
      "Análise técnica de contratos existentes para identificar riscos, inconsistências e oportunidades de aprimoramento.",
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

export default function ContratosPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          getServiceSchema({
            name: "Contratos",
            description:
              "Elaboração, revisão e negociação de contratos para prestadores de serviços, criadores de conteúdo e negócios digitais.",
            url: PAGE_URL,
          }),
          getBreadcrumbSchema([
            { name: "Home", url: BASE_URL },
            { name: "Contratos", url: PAGE_URL },
          ]),
        ])}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        <Reveal>
          <h1 className="max-w-3xl text-4xl sm:text-6xl">
            <em className="italic text-gold">Contratos</em> elaborados e
            revisados para dar segurança às relações digitais.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-dim">
            Elaboração, revisão e negociação de contratos para prestadores de
            serviços, criadores de conteúdo e negócios digitais, com atenção
            a cláusulas, riscos e conformidade regulatória.
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
              A validade e a interpretação dos contratos seguem as regras
              gerais estabelecidas pelo Código Civil, com atenção adicional
              às particularidades das relações formadas e executadas em
              ambiente digital.
            </p>
            <a
              href="https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-gold underline"
            >
              Fonte: Código Civil, Lei nº 10.406/2002
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
            <ContratosForm />
          </Reveal>
        </div>
      </section>

      {/* Fechamento */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <Reveal className="flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl">
              Precisa elaborar ou revisar um contrato para sua atividade
              digital?
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

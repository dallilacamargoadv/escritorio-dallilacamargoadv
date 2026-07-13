import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { EnclosureNested } from "@/components/ui/EnclosureNested";
import { JsonLd } from "@/components/JsonLd";
import { PropriedadeIntelectualForm } from "@/components/forms/PropriedadeIntelectualForm";
import type { IconName } from "@/components/ui/Icon";
import {
  BASE_URL,
  getBreadcrumbSchema,
  getServiceSchema,
  jsonLdGraph,
} from "@/lib/schema";

const SLUG = "propriedade-intelectual";
const PAGE_URL = `${BASE_URL}/${SLUG}`;

export const metadata: Metadata = {
  title: "Propriedade Intelectual",
  description:
    "Assessoria em registro de marcas, direitos autorais e licenciamento para criadores de conteúdo e negócios digitais que precisam proteger seus ativos intelectuais.",
  alternates: { canonical: `/${SLUG}` },
};

const CARDS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "marca",
    title: "Registro de Marca",
    description:
      "Assessoria em todas as etapas do registro de marca perante o INPI, desde a análise inicial até o acompanhamento do processo.",
  },
  {
    icon: "autoral",
    title: "Direitos Autorais",
    description:
      "Orientação sobre proteção de obras intelectuais, conteúdos digitais, materiais criativos e demais criações protegidas por lei.",
  },
  {
    icon: "licenciamento",
    title: "Licenciamento de Marca",
    description:
      "Elaboração e revisão de contratos para licenciamento, cessão e autorização de uso de marcas e outros ativos intelectuais.",
  },
  {
    icon: "defesa",
    title: "Defesa de Ativos",
    description:
      "Atuação em conflitos envolvendo uso indevido de marcas, conteúdos e outros direitos de propriedade intelectual, nas esferas cabíveis.",
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

export default function PropriedadeIntelectualPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          getServiceSchema({
            name: "Propriedade Intelectual",
            description:
              "Atuação em registro de marcas, direitos autorais e licenciamento para criadores de conteúdo, empresas e profissionais.",
            url: PAGE_URL,
          }),
          getBreadcrumbSchema([
            { name: "Home", url: BASE_URL },
            { name: "Propriedade Intelectual", url: PAGE_URL },
          ]),
        ])}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        <Reveal>
          <h1 className="max-w-3xl text-4xl sm:text-6xl">
            <em className="italic text-gold">Propriedade Intelectual</em>{" "}
            protegida com técnica e acompanhamento contínuo.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-dim">
            Atuação em registro de marcas, direitos autorais e licenciamento
            para criadores de conteúdo, empresas e profissionais que
            constroem ativos intelectuais no ambiente digital.
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
              O registro de marcas no Brasil segue os procedimentos definidos
              pela Lei da Propriedade Industrial, com análise conduzida pelo
              Instituto Nacional da Propriedade Industrial (INPI).
            </p>
            <a
              href="https://www.planalto.gov.br/ccivil_03/leis/l9279.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-gold underline"
            >
              Fonte: Lei da Propriedade Industrial, Lei nº 9.279/1996
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
            <PropriedadeIntelectualForm />
          </Reveal>
        </div>
      </section>

      {/* Fechamento */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <Reveal className="flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl">
              Quer proteger uma marca, obra ou outro ativo intelectual do seu
              negócio digital?
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

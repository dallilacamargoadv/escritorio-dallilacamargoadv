import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { EnclosureNested } from "@/components/ui/EnclosureNested";
import { ThreeStepsScroll } from "@/components/ThreeStepsScroll";
import { PointsOfAttention } from "@/components/PointsOfAttention";
import { JsonLd } from "@/components/JsonLd";
import { PropriedadeIntelectualForm } from "@/components/forms/PropriedadeIntelectualForm";
import { AREA_CONTENT } from "@/lib/area-content";
import {
  BASE_URL,
  getBreadcrumbSchema,
  getServiceSchema,
  jsonLdGraph,
} from "@/lib/schema";

const SLUG = "propriedade-intelectual";
const PAGE_URL = `${BASE_URL}/${SLUG}`;
const CONTENT = AREA_CONTENT[SLUG];

export const metadata: Metadata = {
  title: "Propriedade Intelectual",
  description:
    "Assessoria em registro de marcas, direitos autorais e licenciamento para criadores de conteúdo e negócios digitais que precisam proteger seus ativos intelectuais.",
  alternates: { canonical: `/${SLUG}` },
};

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

      {/* Nossa Atuação */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionEyebrow>Nossa Atuação</SectionEyebrow>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTENT.cards.map((card, index) => (
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

      <ThreeStepsScroll title="Etapas" steps={CONTENT.steps} />

      <PointsOfAttention
        introTitle={CONTENT.attention.introTitle}
        introDescription={CONTENT.attention.introDescription}
        points={CONTENT.attention.points}
      />

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
            <h2 className="text-3xl sm:text-4xl">
              Vamos conversar sobre o seu caso.
            </h2>
            <p className="mt-4 text-sm text-ink-dim">
              Preencha as perguntas abaixo. A equipe entra em contato em até
              dois dias úteis.
            </p>
            <div className="mt-10">
              <PropriedadeIntelectualForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

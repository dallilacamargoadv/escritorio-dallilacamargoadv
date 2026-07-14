import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { EnclosureNested } from "@/components/ui/EnclosureNested";
import { ThreeStepsScroll } from "@/components/ThreeStepsScroll";
import { PointsOfAttention } from "@/components/PointsOfAttention";
import { JsonLd } from "@/components/JsonLd";
import { AssessoriaEstrategicaForm } from "@/components/forms/AssessoriaEstrategicaForm";
import { AREA_CONTENT } from "@/lib/area-content";
import {
  BASE_URL,
  getBreadcrumbSchema,
  getServiceSchema,
  jsonLdGraph,
} from "@/lib/schema";

const SLUG = "assessoria-estrategica";
const PAGE_URL = `${BASE_URL}/${SLUG}`;
const CONTENT = AREA_CONTENT[SLUG];

export const metadata: Metadata = {
  title: "Assessoria Estratégica",
  description:
    "Orientação jurídica preventiva para influenciadores, criadores de conteúdo e negócios digitais em temas de proteção de dados, LGPD e relações digitais.",
  alternates: { canonical: `/${SLUG}` },
};

export default function AssessoriaEstrategicaPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          getServiceSchema({
            name: "Assessoria Estratégica",
            description:
              "Orientação jurídica preventiva para influenciadores, criadores de conteúdo, prestadores de serviços e negócios digitais em temas relacionados à proteção de dados, LGPD, relações digitais e desafios jurídicos decorrentes da tecnologia.",
            url: PAGE_URL,
          }),
          getBreadcrumbSchema([
            { name: "Home", url: BASE_URL },
            { name: "Assessoria Estratégica", url: PAGE_URL },
          ]),
        ])}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        <Reveal>
          <h1 className="max-w-3xl text-4xl sm:text-6xl">
            <em className="italic text-gold">Assessoria Estratégica</em> para
            decisões jurídicas claras no ambiente digital.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-dim">
            Orientação jurídica preventiva para influenciadores, criadores
            de conteúdo, prestadores de serviços e negócios digitais em
            temas relacionados à proteção de dados, LGPD, relações digitais
            e desafios jurídicos decorrentes da tecnologia.
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
              Questões relacionadas à proteção de dados pessoais são
              disciplinadas pela Lei Geral de Proteção de Dados, que
              estabelece princípios e regras para o tratamento de dados no
              Brasil.
            </p>
            <a
              href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-gold underline"
            >
              Fonte: Lei Geral de Proteção de Dados, Lei nº 13.709/2018
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
              <AssessoriaEstrategicaForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { AtendimentoHero } from "@/components/ui/AtendimentoHero";
import { EnclosureNested } from "@/components/ui/EnclosureNested";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ThreeStepsScroll } from "@/components/ThreeStepsScroll";
import { PointsOfAttention } from "@/components/PointsOfAttention";
import { JsonLd } from "@/components/JsonLd";
import { AlvaraMirimForm } from "@/components/forms/AlvaraMirimForm";
import { AREA_CONTENT } from "@/lib/area-content";
import { FAQ_CONTENT } from "@/lib/faq-content";
import { getPageMetadata } from "@/lib/page-metadata";
import {
  BASE_URL,
  getBreadcrumbSchema,
  getFaqSchema,
  getServiceSchema,
  jsonLdGraph,
} from "@/lib/schema";

const SLUG = "alvara-mirim";
const PAGE_URL = `${BASE_URL}/${SLUG}`;
const CONTENT = AREA_CONTENT[SLUG];
const FAQ = FAQ_CONTENT[SLUG];

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    slug: SLUG,
    path: `/${SLUG}`,
    fallbackTitle: "Alvará Mirim",
    fallbackDescription:
      "Autorização judicial para criança ou adolescente atuar como influenciador digital, exigida pelas plataformas desde a Lei nº 15.211/2025 (ECA Digital).",
  });
}

export default function AlvaraMirimPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          getServiceSchema({
            name: "Alvará Mirim",
            description:
              "Pedido de alvará judicial para atividade artística e de influenciador digital de criança e adolescente, com base no ECA e na Lei nº 15.211/2025.",
            url: PAGE_URL,
          }),
          getBreadcrumbSchema([
            { name: "Home", url: BASE_URL },
            { name: "Alvará Mirim", url: PAGE_URL },
          ]),
          getFaqSchema(FAQ),
        ])}
      />

      <AtendimentoHero
        eyebrow="alvará mirim"
        title={
          <>
            Seu filho cria conteúdo.{" "}
            <em className="italic text-atendimento-accent">
              A lei já exige autorização
            </em>{" "}
            pra isso continuar.
          </>
        }
        description="Desde 2026 a lei já deixa a plataforma exigir alvará judicial pra manter a monetização do seu filho ativa. Cuido de tudo, do pedido até a decisão, com a criança sempre protegida."
      >
        <div className="mt-8">
          <Button href="#formulario" variant="invert">
            Iniciar atendimento
          </Button>
        </div>
      </AtendimentoHero>

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
              O alvará judicial para atividade artística infantil segue os
              artigos 147, inciso I, e 149, inciso II e §1º, do Estatuto da
              Criança e do Adolescente (Lei nº 8.069/1990), com fundamento no
              artigo 227 da Constituição Federal. É pedido de jurisdição
              voluntária na Vara da Infância e da Juventude, não trabalhista,
              conforme fixado pelo STF na ADI 5326/DF. Desde a Lei nº
              15.211/2025 (ECA Digital), em vigor desde 17 de março de 2026,
              as plataformas digitais também podem exigir a comprovação do
              alvará pra manter a monetização e o impulsionamento de contas
              de influenciadores mirins.
            </p>
            <a
              href="https://www.planalto.gov.br/ccivil_03/leis/l8069.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-gold underline"
            >
              Fonte: Estatuto da Criança e do Adolescente, Lei nº 8.069/1990
            </a>
          </EnclosureNested>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionEyebrow>Perguntas frequentes</SectionEyebrow>
          <div className="mt-6">
            <FaqAccordion items={FAQ} />
          </div>
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
              Vamos conversar sobre o caso.
            </h2>
            <p className="mt-4 text-sm text-ink-dim">
              Preencha as perguntas abaixo. A equipe entra em contato em até
              dois dias úteis.
            </p>
            <div className="mt-10">
              <AlvaraMirimForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

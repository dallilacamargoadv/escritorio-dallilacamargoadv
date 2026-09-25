import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { AtendimentoHero } from "@/components/ui/AtendimentoHero";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ThreeStepsScroll } from "@/components/ThreeStepsScroll";
import { JsonLd } from "@/components/JsonLd";
import { PropriedadeIntelectualForm } from "@/components/forms/PropriedadeIntelectualForm";
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

const SLUG = "registrar-marca";
const PAGE_URL = `${BASE_URL}/${SLUG}`;
const CONTENT = AREA_CONTENT["registro-de-marca"];
const FAQ = FAQ_CONTENT["registro-de-marca"];

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    slug: SLUG,
    path: `/${SLUG}`,
    fallbackTitle: "Registrar Marca no INPI",
    fallbackDescription:
      "Busca de anterioridade e registro de marca no INPI, do início ao deferimento. Fale com uma advogada especialista em Direito Digital.",
  });
}

export default function RegistrarMarcaLandingPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          getServiceSchema({
            name: "Registro de Marca no INPI",
            description:
              "Busca de anterioridade e registro de marca no INPI para criadores de conteúdo, infoprodutores e negócios digitais.",
            url: PAGE_URL,
          }),
          getBreadcrumbSchema([
            { name: "Home", url: BASE_URL },
            { name: "Registrar Marca", url: PAGE_URL },
          ]),
          getFaqSchema(FAQ),
        ])}
      />

      <AtendimentoHero
        eyebrow="registro de marca · INPI"
        title={
          <>
            Registre sua marca antes que{" "}
            <em className="italic text-atendimento-accent">
              outra pessoa registre
            </em>
            .
          </>
        }
        description="No Brasil, a marca é de quem deposita primeiro no INPI, não de quem usa primeiro. Faço a busca de anterioridade, o pedido de registro e acompanho até o deferimento."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="#formulario" variant="invert">
            Quero registrar minha marca
          </Button>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-atendimento-body">
          OAB/PA nº 36.762 · Atendimento 100% remoto, Brasil todo
        </p>
      </AtendimentoHero>

      {/* O que fazemos */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionEyebrow>O que fazemos por você</SectionEyebrow>
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

      <ThreeStepsScroll title="Como funciona" steps={CONTENT.steps} />

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
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
              Vamos registrar sua marca.
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

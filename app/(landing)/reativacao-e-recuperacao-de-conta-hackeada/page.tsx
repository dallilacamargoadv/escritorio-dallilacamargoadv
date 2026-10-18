import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { AtendimentoHero } from "@/components/ui/AtendimentoHero";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ThreeStepsScroll } from "@/components/ThreeStepsScroll";
import { JsonLd } from "@/components/JsonLd";
import { ContasEPlataformasForm } from "@/components/forms/ContasEPlataformasForm";
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

const SLUG = "reativacao-e-recuperacao-de-conta-hackeada";
const PAGE_URL = `${BASE_URL}/${SLUG}`;
const CONTENT = AREA_CONTENT["contas-e-plataformas"];
// FAQ próprio desta landing (perguntas de conta hackeada/banida), separado do
// FAQ da página de área, que agora também cobre marketplaces.
const FAQ = FAQ_CONTENT["conta-hackeada"];
// Cartões da página de área que falam de recuperar/reativar conta. Atenção: o
// filtro é por título exato, então mude aqui se mudar os títulos em area-content.
const RECOVERY_CARDS = CONTENT.cards.filter((card) =>
  [
    "Contas profissionais e Meta (Instagram, Facebook, WhatsApp)",
    "Remoção de Conteúdo e Perfil Falso",
    "Desmonetização e Strikes (YouTube, TikTok, Instagram)",
  ].includes(card.title),
);

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    slug: SLUG,
    path: `/${SLUG}`,
    fallbackTitle: "Reativação e Recuperação de Conta Hackeada",
    fallbackDescription:
      "Sua conta do Instagram, Facebook, WhatsApp ou TikTok foi hackeada, suspensa ou banida? Atuação jurídica na reativação do acesso, do pedido à plataforma à medida judicial, quando cabível.",
  });
}

export default function ReativacaoDeContaLandingPage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          getServiceSchema({
            name: "Reativação e Recuperação de Conta Hackeada",
            description:
              "Atuação jurídica em casos de conta hackeada, desativada, suspensa ou banida em redes sociais e plataformas digitais.",
            url: PAGE_URL,
          }),
          getBreadcrumbSchema([
            { name: "Home", url: BASE_URL },
            { name: "Reativação de Conta", url: PAGE_URL },
          ]),
          getFaqSchema(FAQ),
        ])}
      />

      <AtendimentoHero
        eyebrow="contas e plataformas · reativação de conta"
        title={
          <>
            Perdeu o acesso à sua conta?{" "}
            <em className="italic text-atendimento-accent">
              Entenda os caminhos possíveis.
            </em>
          </>
        }
        description="Conta hackeada, suspensa ou banida no Instagram, Facebook, WhatsApp, TikTok ou YouTube: do pedido administrativo à ação judicial com tutela de urgência, quando necessário."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="#formulario" variant="invert">
            Quero reativar minha conta
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {RECOVERY_CARDS.map((card, index) => (
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
              Vamos reativar sua conta.
            </h2>
            <p className="mt-4 text-sm text-ink-dim">
              Preencha as perguntas abaixo. A equipe entra em contato em até
              dois dias úteis.
            </p>
            <div className="mt-10">
              <ContasEPlataformasForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

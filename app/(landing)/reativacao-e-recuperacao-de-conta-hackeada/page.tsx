import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
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
const ALL_FAQ = FAQ_CONTENT["contas-e-plataformas"];
// Só as perguntas sobre reativar/recuperar conta — a de remoção de conteúdo
// fica de fora aqui de propósito, pra manter a landing no assunto do anúncio.
const FAQ = ALL_FAQ.filter((item) => !item.question.includes("remover"));
// As duas primeiras cards (Meta e Perfil Falso/Fake) são as que falam
// diretamente de reativação/recuperação de conta.
const RECOVERY_CARDS = CONTENT.cards.filter((card) =>
  ["Meta (Instagram, Facebook, WhatsApp)", "Perfil Falso / Fake", "Strikes e Restrições (YouTube, Instagram, TikTok)"].includes(
    card.title,
  ),
);

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    slug: SLUG,
    path: `/${SLUG}`,
    fallbackTitle: "Reativação e Recuperação de Conta Hackeada",
    fallbackDescription:
      "Sua conta do Instagram, Facebook, WhatsApp ou TikTok foi hackeada, suspensa ou banida? Atuação jurídica pra reativar o acesso. Fale com uma advogada especialista.",
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

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <Reveal>
          <p className="font-eyebrow text-[10px] text-gold">
            Contas e Plataformas · Reativação de Conta
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl sm:text-6xl">
            Perdeu o acesso à sua conta?{" "}
            <em className="italic text-gold">A gente reativa.</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-dim">
            Conta hackeada, suspensa ou banida no Instagram, Facebook,
            WhatsApp, TikTok ou YouTube — do pedido administrativo à ação
            judicial com tutela de urgência, quando necessário.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#formulario">Quero reativar minha conta</Button>
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-ink-dim">
            OAB/PA nº 36.762 · Atendimento 100% remoto, Brasil todo
          </p>
        </Reveal>
      </section>

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

import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/JsonLd";
import type { IconName } from "@/components/ui/Icon";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import {
  getLegalServiceSchema,
  getPersonSchema,
  getWebsiteSchema,
  jsonLdGraph,
} from "@/lib/schema";
import { SITE } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Direito Digital",
  description:
    "Assessoria jurídica em Direito Digital para criadores de conteúdo, profissionais liberais e negócios digitais: contratos, marcas e proteção de dados.",
  alternates: { canonical: "/" },
};

const AREAS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "contrato",
    title: "Contratos Digitais",
    description:
      "Elaboração, revisão e negociação de contratos adaptados às relações comerciais no ambiente digital.",
  },
  {
    icon: "marca",
    title: "Proteção de Marcas",
    description:
      "Atuação em registro, acompanhamento e estratégias para proteção de marcas e outros ativos distintivos.",
  },
  {
    icon: "digital",
    title: "Criadores de Conteúdo",
    description:
      "Assessoria jurídica para influenciadores, produtores de conteúdo e profissionais da economia digital.",
  },
  {
    icon: "processo",
    title: "Direito Digital",
    description:
      "Orientação jurídica para relações, responsabilidades e desafios decorrentes do ambiente digital.",
  },
  {
    icon: "plataforma",
    title: "Contas e Plataformas",
    description:
      "Atuação em questões relacionadas a contas comprometidas, plataformas digitais e incidentes virtuais.",
  },
  {
    icon: "dados",
    title: "Proteção de Dados",
    description:
      "Adequação e orientação sobre privacidade, tratamento de dados pessoais e conformidade com a LGPD.",
  },
  {
    icon: "autoral",
    title: "Propriedade Intelectual",
    description:
      "Proteção jurídica de marcas, direitos autorais e demais ativos intelectuais ligados ao ambiente digital.",
  },
  {
    icon: "estrategia",
    title: "Consultoria Estratégica",
    description:
      "Apoio jurídico preventivo para decisões, projetos e negócios em constante transformação tecnológica.",
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

export default function HomePage() {
  const posts = getAllPosts();
  const recentPosts = posts.slice(0, 3);
  const showRecentContent = recentPosts.length >= 3;

  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          getLegalServiceSchema(),
          getPersonSchema(),
          getWebsiteSchema(),
        ])}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        <Reveal>
          <h1 className="max-w-3xl text-4xl sm:text-6xl">
            <em className="italic text-gold">Direito Digital</em> com método
            para quem constrói negócios, marca e conteúdo na internet.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-dim">
            Assessoria jurídica para criadores de conteúdo, profissionais
            liberais e negócios digitais que precisam de contratos claros,
            proteção de marca e resposta rápida a golpes e invasões de conta.
          </p>
          <div className="mt-8">
            <Button href="/contato">Iniciar atendimento</Button>
          </div>
        </Reveal>
      </section>

      {/* Áreas de Atuação */}
      <section
        id="areas-de-atuacao"
        className="scroll-mt-20 mx-auto max-w-6xl px-4 py-20 sm:px-6"
      >
        <Reveal>
          <SectionEyebrow>Áreas de Atuação</SectionEyebrow>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AREAS.map((area, index) => (
              <FeatureCard
                key={area.title}
                icon={area.icon}
                number={String(index + 1).padStart(2, "0")}
                title={area.title}
                description={area.description}
              />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Sobre Nós */}
      <section
        id="sobre-nos"
        className="scroll-mt-20 border-t border-hairline bg-bg-alt"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <SectionEyebrow>Sobre Nós</SectionEyebrow>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div>
                <h2 className="text-xl">Missão</h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                  O escritório tem como missão oferecer assessoria jurídica
                  estratégica a profissionais, criadores de conteúdo,
                  prestadores de serviços e negócios que atuam no ambiente
                  digital, contribuindo para que suas relações, ativos e
                  decisões sejam estruturados com clareza, responsabilidade e
                  segurança jurídica. Por meio de atuação técnica, estudo
                  contínuo das transformações tecnológicas e atendimento
                  personalizado, busca traduzir a complexidade do Direito
                  Digital em soluções jurídicas compatíveis com a realidade
                  de cada cliente, promovendo previsibilidade, organização e
                  conformidade nas relações jurídicas, sempre em observância
                  aos princípios éticos da advocacia.
                </p>
              </div>
              <div>
                <h2 className="text-xl">Visão</h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                  Ser reconhecido como um escritório de referência em Direito
                  Digital e Propriedade Intelectual, especialmente na
                  assessoria jurídica a criadores de conteúdo, prestadores de
                  serviços e negócios da economia digital, destacando-se pela
                  excelência técnica, atuação estratégica, estudo contínuo
                  das transformações tecnológicas e compromisso com uma
                  advocacia ética, inovadora e orientada à construção de
                  relações jurídicas sólidas e duradouras.
                </p>
              </div>
              <div>
                <h2 className="text-xl">Valores</h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                  Princípios da ética profissional, da integridade, do
                  sigilo, da excelência técnica e da responsabilidade
                  jurídica. Valoriza o estudo contínuo como fundamento para
                  acompanhar a constante evolução do Direito Digital e das
                  tecnologias, buscando oferecer uma atuação estratégica,
                  clara e personalizada às necessidades de cada cliente. Atua
                  com transparência, respeito às relações construídas e
                  compromisso com a prevenção de riscos, sempre observando
                  rigorosamente o Estatuto da Advocacia, o Código de Ética e
                  Disciplina da OAB, o Provimento nº 205/2021 do Conselho
                  Federal da OAB e as demais normas aplicáveis à publicidade
                  e ao exercício da advocacia.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* A Fundadora */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionEyebrow>A Fundadora</SectionEyebrow>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            <div className="relative aspect-4/5 w-full max-w-md overflow-hidden border border-hairline">
              <Image
                src="/images/foto-fundadora-2.png"
                alt="Dallila Camargo, advogada"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h2 className="text-3xl italic">Dallila Camargo</h2>
              <p className="mt-2 font-eyebrow text-[10px] text-gold">
                {SITE.oab}
              </p>
              <p className="mt-6 text-sm leading-relaxed text-ink-dim">
                Três anos de advocacia, sendo um ano dedicado ao Direito
                Digital, com atuação também em Direito Civil no geral. Mais
                de vinte casos atendidos.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                Pós-graduada em Direito Digital, Direito Tributário e Direito
                Constitucional, com atuação voltada ao estudo contínuo das
                transformações do ambiente digital. Ex-membra da Comissão da
                Jovem Advocacia (COJAD) da Subseção de Redenção/PA.
              </p>
              <div className="mt-8">
                <Button href="/contato" variant="secondary">
                  Conversar com a advogada
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Como Iniciar */}
      <section className="border-t border-hairline bg-bg-alt">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <SectionEyebrow>Como Iniciar</SectionEyebrow>
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

      {/* Conteúdo Recente (condicional: só com 3+ posts publicados) */}
      {showRecentContent && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <SectionEyebrow>Conteúdo Recente</SectionEyebrow>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {recentPosts.map((post) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block border border-hairline p-6 transition-colors duration-150 hover:border-gold"
                >
                  <span className="font-eyebrow text-[10px] text-gold">
                    {post.category}
                  </span>
                  <h3 className="mt-3 text-lg">{post.title}</h3>
                  <time className="mt-3 block font-mono text-xs text-ink-dim">
                    {formatDate(post.date)}
                  </time>
                </a>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* Fechamento */}
      <section className="border-t border-hairline bg-bg-alt">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <Reveal className="flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl">
              Quer conversar sobre o seu caso?
            </h2>
            <div className="mt-8">
              <Button href="/contato">Iniciar atendimento</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

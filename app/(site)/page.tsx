import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { CollapsibleText } from "@/components/ui/CollapsibleText";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import {
  getLegalServiceSchema,
  getPersonSchema,
  getWebsiteSchema,
  jsonLdGraph,
} from "@/lib/schema";
import { SERVICE_AREAS, SITE } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Direito Digital",
  description:
    "Assessoria jurídica em Direito Digital para criadores de conteúdo, profissionais liberais e negócios digitais: contratos, marcas e proteção de dados.",
  alternates: { canonical: "/" },
};

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
          <h1 className="max-w-xl text-4xl sm:text-6xl">
            <em className="italic text-gold">Direito Digital</em> com método
            para quem constrói negócios, marca e conteúdo na internet.
          </h1>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/contato">Iniciar atendimento</Button>
            <Button href="#areas-de-atuacao" variant="secondary">
              Áreas de Atuação
            </Button>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_AREAS.map((area, index) => (
              <FeatureCard
                key={area.slug}
                icon={area.icon}
                number={String(index + 1).padStart(2, "0")}
                title={area.shortLabel}
                description={area.description}
                href={`/${area.slug}`}
              />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Fundamentos do Escritório */}
      <section className="border-t border-hairline bg-bg-alt">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <SectionEyebrow>Fundamentos do Escritório</SectionEyebrow>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <CollapsibleText title="Missão">
                Transformar a complexidade do ambiente digital em decisões
                jurídicas claras, estratégicas e responsáveis, assessorando
                profissionais, criadores de conteúdo e negócios que desejam
                construir relações sólidas, proteger seus ativos e
                desenvolver seus projetos com segurança jurídica.
              </CollapsibleText>
              <CollapsibleText title="Visão">
                Ser reconhecida como referência em Direito Digital,
                Contratos e Propriedade Intelectual pela capacidade de unir
                excelência técnica, atualização constante e uma advocacia
                que acompanha a evolução da tecnologia sem perder de vista
                as pessoas e as relações que ela transforma.
              </CollapsibleText>
              <CollapsibleText title="Valores">
                Acreditamos que confiança se constrói com ética,
                conhecimento e responsabilidade. Por isso, nossa atuação é
                guiada pela excelência técnica, pelo estudo contínuo das
                transformações tecnológicas, pela clareza na comunicação,
                pelo método bem desenvolvido, pelo respeito às pessoas, pelo
                sigilo profissional, pela transparência nas orientações e
                pelo compromisso com uma advocacia exercida em conformidade
                com o Estatuto da Advocacia, o Código de Ética e Disciplina
                da OAB e o Provimento nº 205/2021.
              </CollapsibleText>
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
              />
            </div>
            <div>
              <h2 className="text-4xl italic sm:text-5xl">Dallila Camargo</h2>
              <p className="mt-2 font-eyebrow text-[10px] text-gold">
                {SITE.oab}
              </p>
              <p className="mt-6 text-sm leading-relaxed text-ink-dim">
                Oi, prazer! Sou Dallila Camargo, advogo há três anos e me
                encontrei profissionalmente no Direito Digital. Atuo de
                forma especializada em Direito Digital, Contratos e
                Propriedade Intelectual, assessorando criadores de
                conteúdo, influenciadores, prestadores de serviços e
                negócios que encontram na internet um espaço para
                construir, inovar e crescer. Acredito que, em um ambiente
                em constante transformação, decisões conscientes começam
                com informação, estratégia e segurança jurídica.
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
            <p className="mt-4 max-w-md text-sm text-ink-dim">
              Atendimento personalizado em Redenção e em todo o Brasil de
              forma remota. Resposta inicial em até dois dias úteis.
            </p>
            <div className="mt-8">
              <Button href="/contato">Iniciar atendimento</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

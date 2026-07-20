import type { Metadata } from "next";
import Image from "next/image";
import { getPageMetadata } from "@/lib/page-metadata";
import { Button } from "@/components/ui/Button";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ThreeStepsScroll } from "@/components/ThreeStepsScroll";
import { JsonLd } from "@/components/JsonLd";
import {
  BASE_URL,
  getBreadcrumbSchema,
  getPersonSchema,
  jsonLdGraph,
} from "@/lib/schema";
import { SITE } from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    slug: "sobre",
    path: "/sobre",
    fallbackTitle: "Sobre",
    fallbackDescription:
      "Conheça a Dallila Camargo I Advocacia: escritório especializado em Direito Digital, Contratos e Propriedade Intelectual, sediado em Redenção, Pará, com atendimento em todo o Brasil.",
  });
}

export default function SobrePage() {
  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          getPersonSchema(),
          getBreadcrumbSchema([
            { name: "Home", url: BASE_URL },
            { name: "Sobre", url: `${BASE_URL}/sobre` },
          ]),
        ])}
      />

      {/* Sobre o Escritório */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        <Reveal>
          <SectionEyebrow>Sobre o Escritório</SectionEyebrow>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm leading-relaxed text-ink-dim">
                A <strong className="text-ink">Dallila Camargo | Advocacia</strong> é
                um escritório especializado em{" "}
                <strong className="text-ink">
                  Direito Digital, Contratos e Propriedade Intelectual
                </strong>
                , com atuação voltada à assessoria jurídica de criadores de
                conteúdo, influenciadores digitais, prestadores de serviços e
                negócios que desenvolvem suas atividades no ambiente digital,
                bem como a aqueles que têm seus direitos violados neste
                ambiente.
              </p>
              <p className="mt-6 text-sm leading-relaxed text-ink-dim">
                Com três anos de atuação jurídica, formação especializada em
                Direito Digital e experiência como ex-membra da Comissão da
                Jovem Advocacia (COJAD) da Subseção de Redenção/PA, o
                escritório desenvolve uma advocacia preventiva, estratégica e
                personalizada, acompanhando as constantes transformações da
                tecnologia para oferecer orientações jurídicas compatíveis
                com a realidade de cada cliente.
              </p>
              <p className="mt-6 text-sm leading-relaxed text-ink-dim">
                Sediado em <strong className="text-ink">Redenção, Pará</strong>,
                o escritório realiza atendimento consultivo e contencioso em
                todo o território nacional, por meio de atendimento 100%
                remoto, com proximidade, transparência e compromisso técnico.
              </p>
              <p className="mt-6 text-sm leading-relaxed text-ink-dim">
                Em um ambiente digital que evolui todos os dias, decisões
                conscientes são construídas com conhecimento, estratégia e
                segurança jurídica.
              </p>
            </div>
            <div className="relative aspect-4/5 w-full max-w-md overflow-hidden border border-hairline md:justify-self-end">
              <Image
                src="/images/foto-fundadora-1.png"
                alt="Dallila Camargo, advogada"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </Reveal>
      </section>

      <ThreeStepsScroll closingText="Metodologia clara, do primeiro contato à atuação." />

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

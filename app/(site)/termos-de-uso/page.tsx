import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { EnclosureNested } from "@/components/ui/EnclosureNested";
import { SITE } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de Uso do site de Dallila Camargo I Advogada: condições de acesso e navegação, direitos autorais e limitação de responsabilidade.",
  alternates: { canonical: "/termos-de-uso" },
  robots: { index: true, follow: true },
};

export default function TermosDeUsoPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <span className="font-eyebrow text-[10px] text-gold">
          Institucional
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl">Termos de Uso</h1>

        <EnclosureNested className="mt-8">
          <p className="text-sm leading-relaxed text-ink-dim">
            Esta é uma minuta institucional gerada para estruturação inicial
            do site e deve ser revisada e validada juridicamente por Dallila
            Camargo antes da publicação definitiva.
          </p>
        </EnclosureNested>

        <div className="prose-article mt-12">
          <p>
            Este documento estabelece as condições gerais de uso do site{" "}
            {SITE.domain}, de titularidade de Dallila Camargo | Advogada,{" "}
            {SITE.oab}. Ao acessar e navegar neste site, o usuário declara
            ter lido e concordado com os termos abaixo.
          </p>

          <h2>1. Aceitação dos Termos</h2>
          <p>
            O simples acesso e uso deste site implica a aceitação integral
            destes Termos de Uso e da{" "}
            <a href="/politica-de-privacidade">Política de Privacidade</a>.
            Caso não concorde com qualquer disposição aqui prevista, o
            usuário deve interromper a navegação.
          </p>

          <h2>2. Finalidade do Site</h2>
          <p>
            Este site tem caráter institucional e informativo, apresentando
            as áreas de atuação do escritório, conteúdo técnico publicado no
            blog e formulários de contato para início de atendimento. O
            conteúdo disponibilizado não constitui aconselhamento jurídico
            individualizado nem substitui a consulta com um profissional
            habilitado.
          </p>

          <h2>3. Relação Cliente-Advogado</h2>
          <p>
            O envio de informações por meio dos formulários deste site, por
            WhatsApp ou por e-mail não estabelece, de forma automática, uma
            relação cliente-advogado. A representação jurídica formal
            depende de análise prévia de conflito de interesses,
            viabilidade técnica e assinatura de Contrato de Prestação de
            Serviços Advocatícios.
          </p>

          <h2>4. Direitos Autorais e Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo publicado neste site, incluindo textos, artigos,
            identidade visual, logotipo e elementos gráficos, é de
            titularidade de Dallila Camargo | Advogada ou utilizado
            mediante licença, sendo protegido pela Lei de Direitos Autorais
            (Lei nº 9.610/1998) e pela Lei da Propriedade Industrial (Lei nº
            9.279/1996). É vedada a reprodução, distribuição ou uso
            comercial do conteúdo sem autorização prévia e expressa.
          </p>

          <h2>5. Limitação de Responsabilidade</h2>
          <p>
            O conteúdo do blog e das páginas institucionais tem caráter
            informativo e educativo, refletindo o entendimento técnico
            vigente na data de publicação. Alterações legislativas ou
            jurisprudenciais posteriores podem afetar a atualidade das
            informações. Dallila Camargo | Advogada não se responsabiliza
            por decisões tomadas exclusivamente com base no conteúdo deste
            site, sem a devida consulta jurídica individualizada.
          </p>

          <h2>6. Links Externos</h2>
          <p>
            Este site pode conter links para fontes oficiais externas (como
            legislação e órgãos públicos). Não nos responsabilizamos pelo
            conteúdo ou pela disponibilidade de sites de terceiros.
          </p>

          <h2>7. Vigência e Modificações</h2>
          <p>
            Estes Termos de Uso podem ser atualizados periodicamente, sem
            aviso prévio, para refletir melhorias técnicas ou alterações
            legislativas. Recomenda-se a leitura periódica deste documento.
          </p>

          <h2>8. Foro de Eleição</h2>
          <p>
            Para dirimir quaisquer controvérsias decorrentes destes Termos
            de Uso, fica eleito o foro da comarca de Redenção, Estado do
            Pará, com renúncia expressa a qualquer outro, por mais
            privilegiado que seja.
          </p>

          <p>
            <strong>Última atualização: julho de 2026.</strong>
          </p>
        </div>
      </Reveal>
    </article>
  );
}

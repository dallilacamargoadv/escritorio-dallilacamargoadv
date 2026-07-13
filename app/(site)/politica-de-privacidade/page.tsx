import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade e Proteção de Dados de Dallila Camargo I Advogada, em conformidade com a LGPD (Lei nº 13.709/2018) e o Provimento nº 205/2021 da OAB.",
  alternates: { canonical: "/politica-de-privacidade" },
  robots: { index: true, follow: true },
};

export default function PoliticaDePrivacidadePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <span className="font-eyebrow text-[10px] text-gold">
          Institucional
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl">
          Política de Privacidade e Proteção de Dados
        </h1>
        <p className="mt-4 text-sm italic text-ink-dim">
          Dallila Camargo | Advocacia Premium &amp; Consultoria Jurídica
          Digital
        </p>

        <div className="prose-article mt-12">
          <p>
            Seja bem-vindo(a) ao nosso portal. Esta Política de Privacidade
            foi elaborada em estrita conformidade com a Lei Geral de
            Proteção de Dados Pessoais (LGPD), Lei nº 13.709/2018, com o
            Código de Ética e Disciplina da OAB e com as melhores práticas
            de transparência digital. O objetivo deste documento é informar
            de maneira clara, objetiva e detalhada como coletamos, tratamos,
            armazenamos e protegemos os seus dados pessoais ao interagir com
            o site dallilacamargoadv.com.br.
          </p>

          <h2>1. Identificação do Controlador</h2>
          <p>
            O tratamento de dados pessoais coletados neste site é
            controlado por:
          </p>
          <ul>
            <li>
              <strong>Controlador:</strong> Dallila Camargo | Advogada (em
              transição e estruturação para constituição de Sociedade
              Individual de Advocacia, CNPJ em andamento).
            </li>
            <li>
              <strong>Domínio de atuação:</strong> dallilacamargoadv.com.br
            </li>
            <li>
              <strong>Canal de Atendimento e Encarregado (DPO):</strong>{" "}
              para exercer seus direitos como titular de dados ou esclarecer
              dúvidas sobre a privacidade de suas informações, você pode
              entrar em contato diretamente pelo e-mail
              dallilacamargoadv@gmail.com.
            </li>
          </ul>

          <h2>2. Compromisso Ético e Institucional (OAB)</h2>
          <p>
            A atuação profissional de Dallila Camargo | Advogada pauta-se
            pelo absoluto sigilo profissional assegurado pelo Estatuto da
            Advocacia (Lei nº 8.906/94). Esta política visa integrar as
            garantias da LGPD com o dever constitucional de preservação do
            segredo profissional e com as diretrizes de marketing jurídico
            ético estabelecidas pelo Provimento nº 205/2021 do Conselho
            Federal da OAB.
          </p>
          <blockquote>
            Aviso importante: o envio de informações através dos nossos
            formulários de contato, WhatsApp ou e-mail não estabelece, de
            forma automática, uma relação cliente-advogado. Qualquer
            representação jurídica formal ou assessoria dependerá de
            análise prévia de conflito de interesses, viabilidade técnica e
            assinatura física ou digital do respectivo Contrato de
            Prestação de Serviços Advocatícios.
          </blockquote>

          <h2>3. Coleta e Tratamento de Dados Pessoais</h2>
          <p>
            Coletamos dados estritamente necessários para viabilizar o
            atendimento personalizado de acordo com a área de interesse do
            usuário. Especificamos abaixo os dados coletados por formulário
            ativo em nosso portal:
          </p>

          <h3>3.1. Formulário de Especialidade: Propriedade Intelectual</h3>
          <p>
            Coleta dados para análise de viabilidade de registro e proteção
            de ativos intangíveis.
          </p>
          <ul>
            <li>
              <strong>Dados coletados:</strong> nome, e-mail, WhatsApp,
              perfil profissional (Criador de conteúdo/Influenciador,
              Infoprodutor, Empresa/E-commerce, Autônomo ou Outros) e
              descrição da necessidade (Registro de marca, Direitos
              autorais, Contratos e licenciamento, Defesa de ativos).
            </li>
            <li>
              <strong>Finalidade:</strong> qualificação do potencial cliente
              e verificação de disponibilidade de registro junto ao INPI ou
              órgãos competentes.
            </li>
          </ul>

          <h3>
            3.2. Formulário de Especialidade: Recuperação e Reativação de
            Conta Hackeada
          </h3>
          <p>Destinado a demandas urgentes de restauração de ativos digitais.</p>
          <ul>
            <li>
              <strong>Dados coletados:</strong> nome, e-mail, WhatsApp,
              descrição do incidente (Invasão/Conta hackeada,
              Bloqueio/Suspensão pela plataforma, Perfil fake/Golpe),
              plataforma afetada (Instagram, Facebook, WhatsApp, E-mail ou
              outra) e natureza de uso (Profissional ou Pessoal).
            </li>
            <li>
              <strong>Finalidade:</strong> urgência jurídica, análise de
              danos à imagem/patrimônio digital e delineamento de
              estratégia judicial ou extrajudicial imediata.
            </li>
          </ul>

          <h3>3.3. Formulário de Especialidade: Contratos</h3>
          <p>
            Estrutura informações para elaboração ou revisão de instrumentos
            jurídicos personalizados.
          </p>
          <ul>
            <li>
              <strong>Dados coletados:</strong> nome, e-mail, WhatsApp, tipo
              de serviço (Elaboração do zero, Revisão de contrato existente
              ou Análise de parceria), atividade principal e urgência do
              prazo de assinatura.
            </li>
            <li>
              <strong>Finalidade:</strong> elaboração de orçamento
              personalizado e análise preliminar de riscos negociais.
            </li>
          </ul>

          <h2>4. Bases Legais para o Tratamento de Dados</h2>
          <p>
            Todo tratamento de dados realizado em nosso site está
            devidamente respaldado pelas bases legais da LGPD, sendo
            primordialmente fundamentado em:
          </p>
          <ol>
            <li>
              <strong>Consentimento (Art. 7º, I, LGPD):</strong> fornecido
              expressamente por você ao preencher nossos formulários e
              optar por enviar as informações, ou ao aceitar expressamente a
              nossa política através da caixa de seleção (checkbox).
            </li>
            <li>
              <strong>
                Procedimentos Preliminares Contratuais (Art. 7º, V, LGPD):
              </strong>{" "}
              necessários para que possamos apresentar propostas de
              honorários e estruturar o escopo de atuação do serviço
              solicitado.
            </li>
            <li>
              <strong>Legítimo Interesse (Art. 7º, IX, LGPD):</strong> para
              a melhoria contínua de nossos serviços e comunicações
              institucionais legítimas.
            </li>
          </ol>

          <h2>5. Armazenamento, Segurança e Retenção dos Dados</h2>
          <p>
            Adotamos medidas técnicas, administrativas e organizacionais
            aptas a proteger os seus dados pessoais de acessos não
            autorizados e de situações acidentais ou ilícitas de
            destruição, perda, alteração ou difusão.
          </p>
          <ul>
            <li>
              <strong>Local de armazenamento:</strong> os dados coletados
              são processados e armazenados em ambiente seguro em nosso
              sistema de gestão de leads (CRM jurídico) e em serviços de
              e-mail corporativo.
            </li>
            <li>
              <strong>Prazo de retenção:</strong> os dados coletados de
              visitantes que não venham a se tornar clientes formais serão
              mantidos em nossa base pelo prazo de até 1 (um) ano, momento
              em que serão definitivamente excluídos, salvo obrigação legal
              de guarda ou necessidade de defesa em âmbito judicial ou
              administrativo.
            </li>
          </ul>

          <h2>6. Cookies e Ferramentas de Análise de Visitantes</h2>
          <p>
            Nosso site utiliza cookies essenciais e analíticos para garantir
            o correto funcionamento técnico, a segurança da navegação e o
            mapeamento de performance. Adotamos o uso de ferramentas como o
            Google Analytics e o Meta Pixel para entender o comportamento de
            navegação em nosso site de forma agregada e anônima, permitindo
            otimizar a experiência do usuário.
          </p>
          <p>
            O portal disponibiliza um banner informativo de consentimento de
            cookies, permitindo que o usuário gerencie suas preferências
            diretamente na primeira visita.
          </p>

          <h2>7. Compartilhamento de Dados</h2>
          <p>
            Em conformidade com a ética advocatícia e a LGPD, os seus dados
            pessoais não são vendidos, alugados ou compartilhados com fins
            comerciais com terceiros. O compartilhamento ocorre única e
            exclusivamente com fornecedores de infraestrutura tecnológica
            essenciais para viabilizar as nossas atividades (como a
            plataforma de hospedagem do site, provedor de e-mail e o sistema
            de gestão de leads), os quais também estão contratualmente
            vinculados às diretrizes de confidencialidade e segurança da
            LGPD.
          </p>

          <h2>8. Direitos dos Titulares de Dados</h2>
          <p>
            Como titular de dados pessoais, você possui amplos direitos
            assegurados pelo Artigo 18 da LGPD, os quais podem ser
            exercidos gratuitamente a qualquer momento através do e-mail
            dallilacamargoadv@gmail.com, incluindo:
          </p>
          <ul>
            <li>Confirmação da existência de tratamento de seus dados;</li>
            <li>Acesso aos seus dados mantidos sob nossa custódia;</li>
            <li>
              Correção de dados incompletos, inexatos ou desatualizados;
            </li>
            <li>
              Eliminação dos dados pessoais tratados com o seu consentimento
              anterior;
            </li>
            <li>
              Revogação do consentimento a qualquer momento de forma
              simplificada.
            </li>
          </ul>

          <h2>9. Atualizações desta Política</h2>
          <p>
            Esta política poderá ser atualizada periodicamente para
            refletir melhorias técnicas, novas funcionalidades ou
            alterações legislativas. Recomendamos a leitura regular deste
            documento.
          </p>
          <p>
            <strong>Última atualização: julho de 2026.</strong>
          </p>
        </div>
      </Reveal>
    </article>
  );
}

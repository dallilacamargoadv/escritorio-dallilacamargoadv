import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getClienteById } from "@/lib/db-clientes";
import { Logo } from "@/components/ui/Logo";
import { PrintButton } from "@/components/admin/PrintButton";
import { dataPorExtenso } from "@/lib/extenso";
import { todayBelemDateString } from "@/lib/atividades-utils";

const OUTORGADO = {
  nome: "Dallila Camargo",
  oab: "OAB/PA nº 36.762",
  endereco: "Redenção/PA (atendimento nacional 100% remoto)",
  email: "dallilacamargoadv@gmail.com",
};

function CardBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-3 left-6 bg-white px-3 font-mono text-[10px] uppercase tracking-widest text-[#7a2430]">
      {children}
    </span>
  );
}

function Card({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mt-8 rounded-2xl border border-[#d8d0c4] px-6 py-7 text-sm leading-7">
      <CardBadge>{label}</CardBadge>
      {children}
    </div>
  );
}

function PoderItem({
  numero,
  children,
}: {
  numero: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 flex gap-3 first:mt-0">
      <span className="shrink-0 font-mono text-xs text-[#7a2430]">{numero}</span>
      <p>{children}</p>
    </div>
  );
}

export default async function ProcuracaoPage(
  props: PageProps<"/admin/clientes/[id]/procuracao">,
) {
  const { id } = await props.params;

  let cliente;
  try {
    cliente = await getClienteById(id);
  } catch {
    redirect("/login");
  }

  if (!cliente) notFound();

  const isPJ = cliente.tipo_pessoa === "pj";
  const dataAtual = dataPorExtenso(todayBelemDateString());

  const outorganteTexto = isPJ ? (
    <>
      <strong>{cliente.nome_razao_social}</strong>, pessoa jurídica inscrita no CNPJ nº{" "}
      <strong>{cliente.documento || "—"}</strong>, com sede em{" "}
      {cliente.endereco?.completo || "—"}
      {cliente.email && cliente.email !== "não tem" ? `, e-mail ${cliente.email}` : ""}, neste
      ato representada por seu(sua) ___________________ (sócio-administrador/diretor/
      procurador), Sr(a). ___________________, RG nº ___________________, CPF nº
      ___________________.
    </>
  ) : (
    <>
      <strong>{cliente.nome_razao_social}</strong>, brasileiro(a), ___________________
      (estado civil), ___________________ (profissão), portador(a) do RG nº
      ___________________, CPF nº <strong>{cliente.documento || "—"}</strong>, residente e
      domiciliado(a) em {cliente.endereco?.completo || "—"}
      {cliente.email && cliente.email !== "não tem" ? `, e-mail ${cliente.email}` : ""}.
    </>
  );

  const outorgadoTexto = (
    <>
      {OUTORGADO.nome}, advogada inscrita na {OUTORGADO.oab}, com endereço profissional em{" "}
      {OUTORGADO.endereco}, e-mail {OUTORGADO.email}, e os demais advogados que venham a ser
      associados ao escritório Dallila Camargo Advocacia.
    </>
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <span className="font-eyebrow text-[10px] text-ink-dim">Procuração</span>
        <PrintButton />
      </div>

      {/* Versão de tela — mesmo tema escuro do painel, resumo rápido antes de imprimir */}
      <div className="border border-hairline p-10 print:hidden">
        <Logo />
        <h1 className="mt-8 text-lg italic text-ink">Procuração ad judicia et extra</h1>
        <p className="mt-4 text-xs text-warning">
          Campos com traço (___________________) não existem no cadastro do cliente — precisam
          ser preenchidos à mão antes de assinar. Confira também se o(a) cliente já assinou
          antes (evita duplicidade) e se a finalidade pede alguma cláusula extra não incluída
          aqui (ex.: procuração apud acta, PJe eletrônica — ver agente `10-procuracao` pra essas
          variantes). A versão formatada pra imprimir sai pelo botão &ldquo;Salvar como
          PDF&rdquo; acima.
        </p>
        <div className="mt-6 space-y-3 text-sm leading-relaxed text-ink">
          <p>
            <span className="text-ink-dim">Outorgante: </span>
            {outorganteTexto}
          </p>
          <p>
            <span className="text-ink-dim">Outorgado: </span>
            {outorgadoTexto}
          </p>
          <div>
            <span className="text-ink-dim">Poderes específicos incluídos: </span>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-dim">
              <li>Ad judicia et extra + todos os especiais do art. 105 CPC</li>
              <li>Representação perante o INPI (registro, oposição, recurso administrativo)</li>
              <li>
                Representação perante plataformas/redes sociais (reativação de conta, remoção
                de conteúdo, contranotificação)
              </li>
              <li>Representação perante a ANPD</li>
              <li>Firmar notificação extrajudicial em nome do(a) outorgante</li>
              <li>Substabelecimento + gratuidade de justiça, se cabível</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 font-mono text-[10px] text-ink-dim">
          Documento emitido pelo sistema de Dallila Camargo I Advocacia.
        </p>
      </div>

      {/* Versão impressa/PDF — estrutura em cartões, mesmo princípio visual do modelo de
          Legal Design (Gabriella Ibrahim) já usado no escritório: proximidade por bloco,
          rótulo sobre a borda, respiro generoso. Cor mínima (peça formal/protocolável). */}
      <div className="hidden bg-white p-10 text-[#1a1a1a] print:block">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-abelha.png"
            alt=""
            width={32}
            height={32}
            aria-hidden="true"
            className="h-8 w-8 shrink-0"
          />
          <div>
            <p className="font-serif text-base italic leading-tight">
              Dallila Camargo Advocacia
            </p>
            <p className="font-mono text-[9px] tracking-wide text-[#6b6b6b]">
              OAB/PA Nº 36.762 · Direito Digital · Redenção/PA
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-[#d8d0c4]" />
          <h1 className="font-serif text-xl italic text-[#7a2430]">
            Procuração Ad Judicia et Extra
          </h1>
          <span className="h-px w-10 bg-[#d8d0c4]" />
        </div>
        <p className="mx-auto mt-4 max-w-md text-center text-xs leading-6 text-[#6b6b6b]">
          Este documento formaliza a representação do(a) outorgante pela advogada Dallila
          Camargo perante tribunais, órgãos públicos e plataformas digitais, com os poderes
          descritos abaixo.
        </p>

        <Card label="Outorgante">{outorganteTexto}</Card>
        <Card label="Outorgado">{outorgadoTexto}</Card>

        <Card label="Poderes">
          <p>
            Pelo presente instrumento, o(a) outorgante constitui o(s) outorgado(s) seu(s)
            bastante(s) procurador(es), conferindo-lhes os poderes da cláusula ad judicia et
            extra para o foro em geral, em qualquer juízo, instância ou tribunal, em ações em
            que seja autor(a), réu(ré), assistente, opoente ou terceiro(a) interessado(a), com
            poderes para:
          </p>
          <PoderItem numero="i">
            propor as ações e medidas competentes para a defesa dos direitos do(a) outorgante;
          </PoderItem>
          <PoderItem numero="ii">
            acompanhar processos administrativos perante quaisquer órgãos públicos;
          </PoderItem>
          <PoderItem numero="iii">
            RECEBER CITAÇÃO INICIAL, CONFESSAR, RECONHECER A PROCEDÊNCIA DO PEDIDO, TRANSIGIR,
            DESISTIR, RENUNCIAR AO DIREITO SOBRE QUE SE FUNDA A AÇÃO, RECEBER E DAR QUITAÇÃO,
            FIRMAR COMPROMISSO, ASSINAR DECLARAÇÃO DE HIPOSSUFICIÊNCIA, conforme art. 105 do
            CPC;
          </PoderItem>
          <PoderItem numero="iv">
            substabelecer este mandato a outros profissionais, com ou sem reservas;
          </PoderItem>
          <PoderItem numero="v">
            representar o(a) outorgante em audiências, sessões e atos do processo, com as
            prerrogativas previstas no Estatuto da OAB (Lei nº 8.906/94).
          </PoderItem>
          <p className="mt-3 text-xs text-[#6b6b6b]">
            Confere-se também poderes para requerer e firmar declaração de hipossuficiência
            nos termos do art. 98 do CPC, se cabível.
          </p>
        </Card>

        <Card label="Poderes específicos">
          <p className="text-xs text-[#6b6b6b]">No que couber ao caso concreto:</p>
          <PoderItem numero="vi">
            representar o(a) outorgante perante o Instituto Nacional da Propriedade
            Industrial (INPI), inclusive para requerer registro de marca, apresentar busca de
            anterioridade, manifestar-se em oposições de terceiros e interpor recursos
            administrativos (art. 158, 159 e 212 da Lei nº 9.279/96);
          </PoderItem>
          <PoderItem numero="vii">
            representar o(a) outorgante perante provedores de aplicações de internet, redes
            sociais, marketplaces e demais plataformas digitais, para requerer reativação de
            conta, remoção de conteúdo, contranotificação e demais medidas de proteção de
            direitos digitais;
          </PoderItem>
          <PoderItem numero="viii">
            representar o(a) outorgante perante a Autoridade Nacional de Proteção de Dados
            (ANPD) e demais órgãos administrativos relacionados à proteção de dados pessoais
            (Lei nº 13.709/2018);
          </PoderItem>
          <PoderItem numero="ix">
            elaborar, firmar e enviar notificações extrajudiciais em nome do(a) outorgante.
          </PoderItem>
        </Card>

        <p className="mt-8 text-center text-xs leading-6 text-[#6b6b6b]">
          A presente procuração tem validade por prazo indeterminado e revoga as anteriores
          outorgadas para o mesmo fim, salvo indicação em contrário.
        </p>

        <p className="mt-8 text-center text-sm">Redenção/PA, {dataAtual}.</p>

        <div className="mx-auto mt-14 w-64 text-center text-sm">
          <p className="border-t border-[#1a1a1a] pt-2">
            {cliente.nome_razao_social}
            {isPJ ? " (representante legal)" : ""}
          </p>
        </div>

        <p className="mt-10 text-center font-mono text-[9px] tracking-wide text-[#6b6b6b]">
          Documento emitido pelo sistema de Dallila Camargo I Advocacia.
        </p>
      </div>
    </div>
  );
}

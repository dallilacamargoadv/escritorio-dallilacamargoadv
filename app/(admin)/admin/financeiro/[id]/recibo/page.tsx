import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getLancamentoById } from "@/lib/db-financeiro";
import { getClienteById } from "@/lib/db-clientes";
import { Logo } from "@/components/ui/Logo";
import { PrintButton } from "@/components/admin/PrintButton";
import { formatDate } from "@/lib/format";
import { valorPorExtenso, dataPorExtenso } from "@/lib/extenso";

export default async function ReciboPage(
  props: PageProps<"/admin/financeiro/[id]/recibo">,
) {
  const { id } = await props.params;

  let lancamento;
  let cliente;
  try {
    lancamento = await getLancamentoById(id);
    if (lancamento) {
      cliente = await getClienteById(lancamento.cliente_id);
    }
  } catch {
    redirect("/login");
  }

  if (!lancamento) notFound();

  const valorFormatado = lancamento.valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const valorExtenso = valorPorExtenso(lancamento.valor);
  const dataExtenso = lancamento.pago_em ? dataPorExtenso(lancamento.pago_em) : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <span className="font-eyebrow text-[10px] text-ink-dim">Recibo</span>
        <PrintButton />
      </div>

      {/* Versão de tela — mesmo tema escuro do painel */}
      <div className="border border-hairline p-10 print:hidden">
        <Logo />
        <h1 className="mt-8 text-lg italic text-ink">Recibo de pagamento</h1>
        <div className="mt-6 space-y-2 text-sm text-ink">
          <p>
            <span className="text-ink-dim">Cliente: </span>
            {cliente?.nome_razao_social ?? "—"}
          </p>
          <p>
            <span className="text-ink-dim">CPF/CNPJ: </span>
            {cliente?.documento || "—"}
          </p>
          <p>
            <span className="text-ink-dim">Descrição: </span>
            {lancamento.descricao}
          </p>
          <p>
            <span className="text-ink-dim">Valor: </span>
            {valorFormatado} <span className="text-ink-dim">({valorExtenso})</span>
          </p>
          <p>
            <span className="text-ink-dim">Pago em: </span>
            {lancamento.pago_em ? formatDate(lancamento.pago_em) : "—"}
          </p>
        </div>
        <p className="mt-8 font-mono text-[10px] text-ink-dim">
          Documento emitido pelo sistema de Dallila Camargo I Advocacia.
        </p>
      </div>

      {/* Versão impressa/PDF — formato formal de recibo, fundo branco */}
      <div className="hidden border border-[#d8d0c4] bg-white p-10 text-[#1a1a1a] print:block">
        <Image
          src="/logo-abelha.png"
          alt=""
          width={36}
          height={36}
          aria-hidden="true"
          className="h-9 w-9 shrink-0"
        />
        <p className="mt-4 font-serif text-lg italic">Dallila Camargo Advocacia</p>
        <p className="mt-1 font-mono text-[10px] tracking-wide text-[#6b6b6b]">
          OAB/PA Nº 36.762 · Direito Digital · Redenção/PA
        </p>
        <p className="mt-6 border-y border-[#d8d0c4] py-2.5 text-center font-mono text-[13px] uppercase tracking-widest">
          Recibo de Pagamento
        </p>
        <p className="mt-7 text-sm leading-8">
          Recebi de <strong>{cliente?.nome_razao_social ?? "—"}</strong>
          {cliente?.documento ? (
            <>
              , CPF/CNPJ nº <strong>{cliente.documento}</strong>
            </>
          ) : null}
          , a importância de{" "}
          <strong>
            {valorFormatado} ({valorExtenso})
          </strong>
          , referente a <strong>{lancamento.descricao}</strong>.
        </p>
        <p className="mt-4 text-sm leading-8">Para clareza, firmo o presente recibo.</p>
        <p className="mt-8 text-sm">
          Redenção/PA, {dataExtenso ?? "—"}.
        </p>
        <p className="mt-10 text-center font-mono text-[10px] tracking-wide text-[#6b6b6b]">
          Documento emitido pelo sistema de Dallila Camargo I Advocacia.
        </p>
      </div>
    </div>
  );
}

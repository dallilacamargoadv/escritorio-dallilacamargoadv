import { notFound, redirect } from "next/navigation";
import { getLancamentoById } from "@/lib/db-financeiro";
import { getClienteById } from "@/lib/db-clientes";
import { Logo } from "@/components/ui/Logo";
import { PrintButton } from "@/components/admin/PrintButton";
import { formatDate } from "@/lib/format";

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

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <span className="font-eyebrow text-[10px] text-ink-dim">Recibo</span>
        <PrintButton />
      </div>

      <div className="border border-hairline p-10">
        <Logo />
        <h1 className="mt-8 text-lg italic text-ink">Recibo de pagamento</h1>
        <div className="mt-6 space-y-2 text-sm text-ink">
          <p>
            <span className="text-ink-dim">Cliente: </span>
            {cliente?.nome_razao_social ?? "—"}
          </p>
          <p>
            <span className="text-ink-dim">Descrição: </span>
            {lancamento.descricao}
          </p>
          <p>
            <span className="text-ink-dim">Valor: </span>
            {lancamento.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p>
            <span className="text-ink-dim">Pago em: </span>
            {lancamento.pago_em ? formatDate(lancamento.pago_em) : "—"}
          </p>
        </div>
        <p className="mt-10 font-mono text-xs text-ink-dim">
          Dallila Camargo Advocacia · OAB/PA Nº 36.762
        </p>
      </div>
    </div>
  );
}

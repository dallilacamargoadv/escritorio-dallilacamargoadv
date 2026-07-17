"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lancamento } from "@/lib/db-financeiro";
import { isLancamentoAtrasado } from "@/lib/financeiro-utils";
import { formatDate } from "@/lib/format";

export function FinanceiroDetail({
  lancamento,
  clienteNome,
  contratoLabel,
}: {
  lancamento: Lancamento;
  clienteNome: string;
  contratoLabel: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const atrasado = isLancamentoAtrasado(lancamento);

  async function handleMarcarPago() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/financeiro/${lancamento.id}`, {
        method: "PATCH",
      });
      if (res.ok) router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">{lancamento.descricao}</h1>
        <p className="font-mono text-xs text-ink-dim">
          {clienteNome} · {contratoLabel}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-eyebrow text-[10px] text-ink-dim">Valor</p>
          <p className="mt-1 font-mono text-ink tabular-nums">
            {lancamento.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div>
          <p className="font-eyebrow text-[10px] text-ink-dim">Vencimento</p>
          <p className="mt-1 text-ink">{formatDate(lancamento.vencimento)}</p>
        </div>
        <div>
          <p className="font-eyebrow text-[10px] text-ink-dim">Status</p>
          <p
            className={`mt-1 ${
              lancamento.status === "pago"
                ? "text-success"
                : atrasado
                  ? "text-error"
                  : "text-gold"
            }`}
          >
            {lancamento.status === "pago" ? "Pago" : atrasado ? "Atrasado" : "Pendente"}
          </p>
        </div>
        {lancamento.pago_em && (
          <div>
            <p className="font-eyebrow text-[10px] text-ink-dim">Pago em</p>
            <p className="mt-1 text-ink">{formatDate(lancamento.pago_em)}</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {lancamento.status === "pendente" ? (
          <button
            type="button"
            onClick={handleMarcarPago}
            disabled={saving}
            className="border border-gold bg-gold px-5 py-2.5 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Marcar como pago"}
          </button>
        ) : (
          <Link
            href={`/admin/financeiro/${lancamento.id}/recibo`}
            target="_blank"
            className="border border-gold px-5 py-2.5 text-sm text-gold transition-colors duration-150 hover:bg-gold hover:text-bg"
          >
            Emitir recibo
          </Link>
        )}
        <button
          type="button"
          onClick={() => router.push("/admin/financeiro")}
          className="border border-hairline-strong px-5 py-2.5 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

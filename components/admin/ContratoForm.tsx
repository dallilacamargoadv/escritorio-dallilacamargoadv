"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Contrato, ContratoStatus, ContratoTipo } from "@/lib/db-contratos";
import type { Caso } from "@/lib/db-casos";
import {
  CASO_STATUS_LABELS,
  CONTRATO_STATUS_LABELS,
  CONTRATO_TIPO_LABELS,
} from "@/lib/admin-labels";

export interface ClienteOption {
  id: string;
  label: string;
}

export function ContratoForm({
  contrato,
  clienteFixo,
  clienteOptions,
  casos,
}: {
  contrato?: Contrato;
  clienteFixo?: ClienteOption;
  clienteOptions?: ClienteOption[];
  casos?: Caso[];
}) {
  const router = useRouter();
  const [clienteId, setClienteId] = useState(
    contrato?.cliente_id ?? clienteFixo?.id ?? clienteOptions?.[0]?.id ?? "",
  );
  const [tipo, setTipo] = useState<ContratoTipo>(contrato?.tipo ?? "projeto");
  const [status, setStatus] = useState<ContratoStatus>(
    contrato?.status ?? "rascunho",
  );
  const [valor, setValor] = useState(
    contrato?.valor != null ? String(contrato.valor) : "",
  );
  const [periodicidade, setPeriodicidade] = useState(
    contrato?.periodicidade ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const clienteLocked = Boolean(contrato) || Boolean(clienteFixo);
  const clienteLabel =
    clienteFixo?.label ??
    clienteOptions?.find((opt) => opt.id === clienteId)?.label ??
    "";

  async function handleSave() {
    if (!clienteId || !tipo) {
      setError("Cliente e tipo são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");

    const url = contrato
      ? `/api/admin/contratos/${contrato.id}`
      : "/api/admin/contratos";
    const method = contrato ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId,
          tipo,
          status,
          valor: valor.trim() ? Number(valor) : null,
          periodicidade,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");

      router.push("/admin/contratos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const novoCasoHref = contrato
    ? `/admin/casos/novo?contratoId=${contrato.id}`
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">
          {contrato ? "Editar contrato" : "Novo contrato"}
        </h1>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Cliente
          </label>
          {clienteLocked ? (
            <p className="mt-2 border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink-dim">
              {clienteLabel}
            </p>
          ) : (
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
            >
              {(clienteOptions ?? []).map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as ContratoTipo)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            {(Object.keys(CONTRATO_TIPO_LABELS) as ContratoTipo[]).map((t) => (
              <option key={t} value={t}>
                {CONTRATO_TIPO_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Valor (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Periodicidade
          </label>
          <input
            type="text"
            placeholder="à vista, mensal, 3x..."
            value={periodicidade}
            onChange={(e) => setPeriodicidade(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        {contrato && (
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContratoStatus)}
              className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
            >
              {(Object.keys(CONTRATO_STATUS_LABELS) as ContratoStatus[]).map(
                (s) => (
                  <option key={s} value={s}>
                    {CONTRATO_STATUS_LABELS[s]}
                  </option>
                ),
              )}
            </select>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="border border-gold bg-gold px-5 py-2.5 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/contratos")}
            className="border border-hairline-strong px-5 py-2.5 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
          >
            Cancelar
          </button>
        </div>
      </div>

      {contrato && (
        <div className="mt-10 border-t border-hairline pt-6">
          <div className="flex items-center justify-between">
            <span className="font-eyebrow text-[10px] text-ink-dim">
              Casos deste contrato
            </span>
            {status === "assinado" ? (
              <Link
                href={novoCasoHref!}
                className="text-xs text-gold transition-colors duration-150 hover:underline"
              >
                + Novo caso
              </Link>
            ) : (
              <span
                className="text-xs text-ink-dim"
                title="Só é possível abrir um caso sob um contrato assinado"
              >
                + Novo caso (requer contrato assinado)
              </span>
            )}
          </div>
          <div className="mt-3 border border-hairline">
            {(casos ?? []).length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-dim">
                Nenhum caso aberto sob este contrato ainda.
              </p>
            )}
            {(casos ?? []).map((caso, index) => (
              <Link
                key={caso.id}
                href={`/admin/casos/${caso.id}`}
                className={`flex items-center justify-between px-4 py-3 text-sm text-ink transition-colors duration-150 hover:text-gold ${
                  index !== (casos ?? []).length - 1 ? "border-b border-hairline" : ""
                }`}
              >
                <span>{caso.titulo}</span>
                <span className="font-mono text-[10px] uppercase text-ink-dim">
                  {CASO_STATUS_LABELS[caso.status]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

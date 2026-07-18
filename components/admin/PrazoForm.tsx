"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Prazo, PrazoStatus, PrazoTipo } from "@/lib/db-prazos";
import { PRAZO_STATUS_LABELS, PRAZO_TIPO_LABELS } from "@/lib/admin-labels";

export interface LinkOption {
  id: string;
  label: string;
}

type VinculoTipo = "nenhum" | "cliente" | "caso" | "frente";

function vinculoTipoInicial(prazo?: Prazo): VinculoTipo {
  if (!prazo) return "nenhum";
  if (prazo.caso_frente_id) return "frente";
  if (prazo.caso_id) return "caso";
  if (prazo.cliente_id) return "cliente";
  return "nenhum";
}

export function PrazoForm({
  prazo,
  clienteOptions,
  casoOptions,
  frenteOptions,
}: {
  prazo?: Prazo;
  clienteOptions: LinkOption[];
  casoOptions: LinkOption[];
  frenteOptions: LinkOption[];
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState<PrazoTipo>(prazo?.tipo ?? "processual");
  const [titulo, setTitulo] = useState(prazo?.titulo ?? "");
  const [data, setData] = useState(prazo?.data ?? "");
  const [hora, setHora] = useState(prazo?.hora?.slice(0, 5) ?? "");
  const [status, setStatus] = useState<PrazoStatus>(prazo?.status ?? "pendente");
  const [vinculoTipo, setVinculoTipo] = useState<VinculoTipo>(vinculoTipoInicial(prazo));
  const [vinculoId, setVinculoId] = useState(
    prazo?.caso_frente_id ?? prazo?.caso_id ?? prazo?.cliente_id ?? "",
  );
  const [visivelCliente, setVisivelCliente] = useState(prazo?.visivel_cliente ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const vinculoOptions =
    vinculoTipo === "cliente"
      ? clienteOptions
      : vinculoTipo === "caso"
        ? casoOptions
        : vinculoTipo === "frente"
          ? frenteOptions
          : [];

  function handleVinculoTipoChange(next: VinculoTipo) {
    setVinculoTipo(next);
    setVinculoId("");
  }

  async function handleSave() {
    if (!titulo.trim() || !data) {
      setError("Título e data são obrigatórios.");
      return;
    }
    if (vinculoTipo !== "nenhum" && !vinculoId) {
      setError("Selecione o vínculo, ou escolha \"Nenhum\".");
      return;
    }

    setSaving(true);
    setError("");

    const url = prazo ? `/api/admin/prazos/${prazo.id}` : "/api/admin/prazos";
    const method = prazo ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          titulo,
          data,
          hora: hora || null,
          status,
          caso_frente_id: vinculoTipo === "frente" ? vinculoId : null,
          caso_id: vinculoTipo === "caso" ? vinculoId : null,
          cliente_id: vinculoTipo === "cliente" ? vinculoId : null,
          visivel_cliente: visivelCliente,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao salvar");

      router.push("/admin/prazos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">
          {prazo ? "Editar prazo" : "Novo prazo"}
        </h1>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as PrazoTipo)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            {(Object.keys(PRAZO_TIPO_LABELS) as PrazoTipo[]).map((t) => (
              <option key={t} value={t}>
                {PRAZO_TIPO_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">
              Hora (opcional)
            </label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Vincular a
          </label>
          <select
            value={vinculoTipo}
            onChange={(e) => handleVinculoTipoChange(e.target.value as VinculoTipo)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="nenhum">Nenhum (avulso)</option>
            <option value="cliente">Cliente</option>
            <option value="caso">Caso</option>
            <option value="frente">Frente de caso</option>
          </select>
        </div>

        {vinculoTipo !== "nenhum" && (
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">
              {vinculoTipo === "cliente" && "Cliente"}
              {vinculoTipo === "caso" && "Caso"}
              {vinculoTipo === "frente" && "Frente"}
            </label>
            <select
              value={vinculoId}
              onChange={(e) => setVinculoId(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
            >
              <option value="">—</option>
              {vinculoOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {(vinculoTipo === "caso" || vinculoTipo === "frente") && (
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={visivelCliente}
              onChange={(e) => setVisivelCliente(e.target.checked)}
              className="h-4 w-4 border-hairline-strong"
            />
            Visível no relatório do cliente
          </label>
        )}

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PrazoStatus)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            {(Object.keys(PRAZO_STATUS_LABELS) as PrazoStatus[]).map((s) => (
              <option key={s} value={s}>
                {PRAZO_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

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
            onClick={() => router.push("/admin/prazos")}
            className="border border-hairline-strong px-5 py-2.5 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Parceiro } from "@/lib/db-parceiros";
import type { TipoPessoa } from "@/lib/db-clientes";
import { TIPO_PESSOA_LABELS } from "@/lib/admin-labels";

export function ParceiroForm({ parceiro }: { parceiro?: Parceiro }) {
  const router = useRouter();
  const [nome, setNome] = useState(parceiro?.nome ?? "");
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>(
    parceiro?.tipo_pessoa ?? "pf",
  );
  const [contato, setContato] = useState(parceiro?.contato ?? "");
  const [observacoes, setObservacoes] = useState(parceiro?.observacoes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!nome.trim()) {
      setError("Nome é obrigatório.");
      return;
    }

    setSaving(true);
    setError("");

    const url = parceiro
      ? `/api/admin/parceiros/${parceiro.id}`
      : "/api/admin/parceiros";
    const method = parceiro ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          tipo_pessoa: tipoPessoa,
          contato,
          observacoes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");

      router.push(`/admin/parcerias/${data.parceiro.id}`);
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
          {parceiro ? "Editar parceiro" : "Novo parceiro"}
        </h1>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Tipo de pessoa
          </label>
          <select
            value={tipoPessoa}
            onChange={(e) => setTipoPessoa(e.target.value as TipoPessoa)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            {(Object.keys(TIPO_PESSOA_LABELS) as TipoPessoa[]).map((tipo) => (
              <option key={tipo} value={tipo}>
                {TIPO_PESSOA_LABELS[tipo]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Contato (e-mail ou WhatsApp)
          </label>
          <input
            type="text"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Observações
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-none border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
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
            onClick={() => router.push("/admin/parcerias")}
            className="border border-hairline-strong px-5 py-2.5 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

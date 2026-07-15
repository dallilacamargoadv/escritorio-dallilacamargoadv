"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Cliente, TipoPessoa } from "@/lib/db-clientes";
import type { Lead } from "@/lib/db-admin";
import { FORM_TYPE_LABELS, TIPO_PESSOA_LABELS } from "@/lib/admin-labels";

export function ClienteForm({
  cliente,
  leadPrefill,
}: {
  cliente?: Cliente;
  leadPrefill?: Lead;
}) {
  const router = useRouter();
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>(
    cliente?.tipo_pessoa ?? "pf",
  );
  const [nomeRazaoSocial, setNomeRazaoSocial] = useState(
    cliente?.nome_razao_social ?? leadPrefill?.name ?? "",
  );
  const [documento, setDocumento] = useState(cliente?.documento ?? "");
  const [email, setEmail] = useState(cliente?.email ?? leadPrefill?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(
    cliente?.whatsapp ?? leadPrefill?.whatsapp ?? "",
  );
  const [enderecoCompleto, setEnderecoCompleto] = useState(
    cliente?.endereco?.completo ?? "",
  );
  const [areaOrigem, setAreaOrigem] = useState(
    cliente?.area_origem ?? leadPrefill?.form_type ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!nomeRazaoSocial.trim() || !email.trim()) {
      setError("Nome/razão social e e-mail são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");

    const url = cliente ? `/api/admin/clientes/${cliente.id}` : "/api/admin/clientes";
    const method = cliente ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_pessoa: tipoPessoa,
          nome_razao_social: nomeRazaoSocial,
          documento,
          email,
          whatsapp,
          endereco: { completo: enderecoCompleto },
          area_origem: areaOrigem || null,
          lead_id: leadPrefill?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");

      router.push(`/admin/clientes/${data.cliente.id}`);
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
          {cliente ? "Editar cliente" : "Novo cliente"}
        </h1>
        {leadPrefill && (
          <p className="mt-1 font-mono text-xs text-gold">
            Convertendo lead: {leadPrefill.name}
          </p>
        )}
      </div>

      <div className="mt-8 space-y-5">
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
            Nome / Razão social
          </label>
          <input
            type="text"
            value={nomeRazaoSocial}
            onChange={(e) => setNomeRazaoSocial(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            CPF / CNPJ
          </label>
          <input
            type="text"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            WhatsApp
          </label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Endereço
          </label>
          <input
            type="text"
            value={enderecoCompleto}
            onChange={(e) => setEnderecoCompleto(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Área de origem
          </label>
          <select
            value={areaOrigem}
            onChange={(e) => setAreaOrigem(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="">—</option>
            {Object.entries(FORM_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
            onClick={() => router.push("/admin/clientes")}
            className="border border-hairline-strong px-5 py-2.5 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

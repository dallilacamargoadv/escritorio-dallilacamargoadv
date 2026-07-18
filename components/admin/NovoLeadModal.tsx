"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Lead } from "@/lib/db-admin";
import type { LeadFormType } from "@/lib/db-leads";
import { FORM_TYPE_LABELS } from "@/lib/admin-labels";

export function NovoLeadModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (lead: Lead) => void;
}) {
  const [formType, setFormType] = useState<LeadFormType | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim() || !email.trim() || !whatsapp.trim() || !formType) {
      setError("Nome, e-mail, WhatsApp e área são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, whatsapp, form_type: formType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");

      onCreated(data.lead as Lead);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Novo lead"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-hairline bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-hairline pb-4">
          <h2 className="text-lg italic text-ink">Novo lead</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-ink-dim transition-colors duration-150 hover:text-gold"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
            />
          </div>
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
            />
          </div>
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">WhatsApp</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
            />
          </div>
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">Área</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as LeadFormType)}
              className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
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
              onClick={onClose}
              className="border border-hairline-strong px-5 py-2.5 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

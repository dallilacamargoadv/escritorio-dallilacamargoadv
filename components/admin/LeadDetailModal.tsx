"use client";

import { useEffect, useState } from "react";
import { MapPin, Cpu, Globe, X } from "lucide-react";
import type { Lead, LeadNote, LeadStatus } from "@/lib/db-admin";
import { FORM_TYPE_LABELS, STATUS_LABELS } from "@/lib/admin-labels";

export function LeadDetailModal({
  lead,
  onClose,
  onUpdate,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}) {
  const metadata = lead.metadata ?? {};
  const location = [metadata.city, metadata.region, metadata.country]
    .filter(Boolean)
    .join(", ");

  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/leads/${lead.id}/notes`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setNotes(data.notes ?? []);
      })
      .finally(() => {
        if (!cancelled) setNotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lead.id]);

  async function handleStatusChange(status: LeadStatus) {
    setStatusSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        onUpdate({
          ...lead,
          status,
          first_contacted_at:
            status !== "novo" && !lead.first_contacted_at
              ? new Date().toISOString()
              : lead.first_contacted_at,
        });
      }
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleAddNote() {
    const body = newNote.trim();
    if (!body) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (res.ok && data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setNewNote("");
      }
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inteligência técnica do lead"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto border border-hairline bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-eyebrow text-[10px] text-gold">
              {FORM_TYPE_LABELS[lead.form_type] ?? lead.form_type}
            </p>
            <h2 className="mt-1 text-lg italic text-ink">{lead.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-ink-dim transition-colors duration-150 hover:text-gold"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5">
          <label
            htmlFor="lead-status"
            className="font-eyebrow text-[10px] text-ink-dim"
          >
            Status
          </label>
          <select
            id="lead-status"
            value={lead.status}
            disabled={statusSaving}
            onChange={(e) =>
              handleStatusChange(e.target.value as LeadStatus)
            }
            className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink disabled:opacity-50"
          >
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 space-y-6 text-sm">
          <section>
            <h3 className="flex items-center gap-2 font-eyebrow text-[10px] text-ink-dim">
              Contato
            </h3>
            <p className="mt-1 text-ink">{lead.email}</p>
            <p className="text-ink">{lead.whatsapp}</p>
          </section>

          <section>
            <h3 className="font-eyebrow text-[10px] text-ink-dim">Notas</h3>
            <div className="mt-2 space-y-3">
              {notesLoading && (
                <p className="text-xs text-ink-dim">Carregando notas...</p>
              )}
              {!notesLoading && notes.length === 0 && (
                <p className="text-xs text-ink-dim">
                  Nenhuma nota registrada ainda.
                </p>
              )}
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="border-l-2 border-hairline-strong pl-3"
                >
                  <p className="text-ink">{note.body}</p>
                  <p className="mt-1 font-mono text-[10px] text-ink-dim">
                    {new Date(note.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  placeholder="Adicionar nota..."
                  className="min-w-0 flex-1 border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={savingNote || !newNote.trim()}
                  className="border border-gold bg-gold px-4 py-2 text-xs text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
                >
                  Salvar
                </button>
              </div>
            </div>
          </section>

          {Object.keys(lead.answers ?? {}).length > 0 && (
            <section>
              <h3 className="font-eyebrow text-[10px] text-ink-dim">
                Respostas
              </h3>
              <dl className="mt-2 space-y-1">
                {Object.entries(lead.answers).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="text-ink-dim">{key}</dt>
                    <dd className="text-right text-ink">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section>
            <h3 className="flex items-center gap-2 font-eyebrow text-[10px] text-ink-dim">
              <MapPin size={14} className="text-gold" /> Geolocalização
            </h3>
            <p className="mt-1 text-ink">{location || "—"}</p>
            <p className="text-xs text-ink-dim">
              IP: {(metadata.ip as string) || "—"}
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-eyebrow text-[10px] text-ink-dim">
              <Cpu size={14} className="text-gold" /> Tecnologia
            </h3>
            <p className="mt-1 text-ink">
              {(metadata.os as string) || "—"} ·{" "}
              {(metadata.device as string) || "—"}
            </p>
            <p className="text-xs text-ink-dim">
              {(metadata.screenResolution as string) || "—"}
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-eyebrow text-[10px] text-ink-dim">
              <Globe size={14} className="text-gold" /> Navegador e idioma
            </h3>
            <p className="mt-1 text-ink">
              {(metadata.browser as string) || "—"} ·{" "}
              {(metadata.language as string) || "—"}
            </p>
          </section>

          {Object.keys(lead.utms ?? {}).length > 0 && (
            <section>
              <h3 className="font-eyebrow text-[10px] text-ink-dim">
                Origem (UTMs)
              </h3>
              <dl className="mt-2 space-y-1">
                {Object.entries(lead.utms).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="text-ink-dim">{key}</dt>
                    <dd className="text-right text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

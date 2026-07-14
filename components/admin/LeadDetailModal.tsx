"use client";

import { MapPin, Cpu, Globe, X } from "lucide-react";
import type { Lead } from "@/lib/db-admin";

const FORM_TYPE_LABELS: Record<string, string> = {
  contratos: "Contratos Digitais",
  propriedade_intelectual: "Propriedade Intelectual",
  contas_e_plataformas: "Contas e Plataformas",
  golpes_virtuais: "Golpes Virtuais",
  assessoria_estrategica: "Assessoria Estratégica",
};

export function LeadDetailModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const metadata = lead.metadata ?? {};
  const location = [metadata.city, metadata.region, metadata.country]
    .filter(Boolean)
    .join(", ");

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

        <div className="mt-6 space-y-6 text-sm">
          <section>
            <h3 className="flex items-center gap-2 font-eyebrow text-[10px] text-ink-dim">
              Contato
            </h3>
            <p className="mt-1 text-ink">{lead.email}</p>
            <p className="text-ink">{lead.whatsapp}</p>
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

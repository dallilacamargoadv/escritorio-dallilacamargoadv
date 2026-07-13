"use client";

import { MapPin, Cpu, Globe, X } from "lucide-react";
import type { Lead } from "@/lib/db-admin";

const FORM_TYPE_LABELS: Record<string, string> = {
  conta_hackeada: "Conta Hackeada",
  contratos: "Contratos",
  propriedade_intelectual: "Propriedade Intelectual",
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
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto border border-neutral-800 bg-neutral-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-neutral-500">
              {FORM_TYPE_LABELS[lead.form_type] ?? lead.form_type}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-neutral-100">
              {lead.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-neutral-500 hover:text-neutral-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-sm">
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-neutral-300">
              Contato
            </h3>
            <p className="mt-1 text-neutral-100">{lead.email}</p>
            <p className="text-neutral-100">{lead.whatsapp}</p>
          </section>

          {Object.keys(lead.answers ?? {}).length > 0 && (
            <section>
              <h3 className="font-semibold text-neutral-300">Respostas</h3>
              <dl className="mt-2 space-y-1">
                {Object.entries(lead.answers).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="text-neutral-500">{key}</dt>
                    <dd className="text-right text-neutral-100">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section>
            <h3 className="flex items-center gap-2 font-semibold text-neutral-300">
              <MapPin size={16} /> Geolocalização
            </h3>
            <p className="mt-1 text-neutral-100">{location || "—"}</p>
            <p className="text-xs text-neutral-500">
              IP: {(metadata.ip as string) || "—"}
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-semibold text-neutral-300">
              <Cpu size={16} /> Tecnologia
            </h3>
            <p className="mt-1 text-neutral-100">
              {(metadata.os as string) || "—"} ·{" "}
              {(metadata.device as string) || "—"}
            </p>
            <p className="text-xs text-neutral-500">
              {(metadata.screenResolution as string) || "—"}
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-semibold text-neutral-300">
              <Globe size={16} /> Navegador e idioma
            </h3>
            <p className="mt-1 text-neutral-100">
              {(metadata.browser as string) || "—"} ·{" "}
              {(metadata.language as string) || "—"}
            </p>
          </section>

          {Object.keys(lead.utms ?? {}).length > 0 && (
            <section>
              <h3 className="font-semibold text-neutral-300">
                Origem (UTMs)
              </h3>
              <dl className="mt-2 space-y-1">
                {Object.entries(lead.utms).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="text-neutral-500">{key}</dt>
                    <dd className="text-right text-neutral-100">{value}</dd>
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

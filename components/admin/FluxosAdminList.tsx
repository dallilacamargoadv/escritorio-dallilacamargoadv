"use client";

import { useState } from "react";
import type { FluxoTemplateComEtapas } from "@/lib/db-fluxo-templates";
import type { LeadFormType } from "@/lib/db-leads";
import type { FrenteTipo } from "@/lib/db-frentes";
import { FORM_TYPE_LABELS, FRENTE_TIPO_LABELS } from "@/lib/admin-labels";

const AREAS = Object.keys(FORM_TYPE_LABELS) as LeadFormType[];
const TIPOS: FrenteTipo[] = ["extrajudicial", "judicial", "administrativo"];

export function FluxosAdminList({
  initialTemplates,
}: {
  initialTemplates: FluxoTemplateComEtapas[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [novaArea, setNovaArea] = useState<LeadFormType>(AREAS[0]);
  const [novoTipo, setNovoTipo] = useState<FrenteTipo>("judicial");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateTemplate() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/fluxos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area: novaArea, tipo_frente: novoTipo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar");
      setTemplates((prev) => [...prev, { ...data.template, etapas: [] }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTemplate(id: string) {
    if (!confirm("Excluir este modelo e todas as etapas dele?")) return;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/admin/fluxos/${id}`, { method: "DELETE" });
  }

  async function handleAddEtapa(
    templateId: string,
    nome: string,
    ordem: number,
    checklist: string[],
    slaDias: number | null,
    minutaUrl: string | null,
  ) {
    const res = await fetch(`/api/admin/fluxos/${templateId}/etapas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        ordem,
        checklist,
        sla_dias: slaDias,
        minuta_url: minutaUrl,
      }),
    });
    const data = await res.json();
    if (res.ok && data.etapa) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId ? { ...t, etapas: [...t.etapas, data.etapa] } : t,
        ),
      );
    }
  }

  async function handleDeleteEtapa(templateId: string, etapaId: string) {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? { ...t, etapas: t.etapas.filter((e) => e.id !== etapaId) }
          : t,
      ),
    );
    await fetch(`/api/admin/fluxos/${templateId}/etapas/${etapaId}`, {
      method: "DELETE",
    });
  }

  const combosExistentes = new Set(templates.map((t) => `${t.area}:${t.tipo_frente}`));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">Modelos de fluxo</h1>
        <p className="mt-1 font-mono text-xs text-ink-dim">
          Etapas padrão por área + tipo de frente — copiadas pro caso quando uma
          frente é criada. Editar aqui não muda casos já criados.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3 border border-hairline-strong bg-surface p-4">
        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">Área</label>
          <select
            value={novaArea}
            onChange={(e) => setNovaArea(e.target.value as LeadFormType)}
            className="mt-2 border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {FORM_TYPE_LABELS[a]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Tipo de frente
          </label>
          <select
            value={novoTipo}
            onChange={(e) => setNovoTipo(e.target.value as FrenteTipo)}
            className="mt-2 border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {FRENTE_TIPO_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleCreateTemplate}
          disabled={saving || combosExistentes.has(`${novaArea}:${novoTipo}`)}
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
        >
          {combosExistentes.has(`${novaArea}:${novoTipo}`)
            ? "Já existe"
            : saving
              ? "Criando..."
              : "+ Novo modelo"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}

      <div className="mt-6 space-y-4">
        {templates.length === 0 && (
          <p className="border border-hairline px-4 py-6 text-center text-sm text-ink-dim">
            Nenhum modelo cadastrado ainda.
          </p>
        )}
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onDeleteTemplate={() => handleDeleteTemplate(template.id)}
            onAddEtapa={(nome, checklist, slaDias, minutaUrl) =>
              handleAddEtapa(
                template.id,
                nome,
                template.etapas.length,
                checklist,
                slaDias,
                minutaUrl,
              )
            }
            onDeleteEtapa={(etapaId) => handleDeleteEtapa(template.id, etapaId)}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onDeleteTemplate,
  onAddEtapa,
  onDeleteEtapa,
}: {
  template: FluxoTemplateComEtapas;
  onDeleteTemplate: () => void;
  onAddEtapa: (
    nome: string,
    checklist: string[],
    slaDias: number | null,
    minutaUrl: string | null,
  ) => void;
  onDeleteEtapa: (etapaId: string) => void;
}) {
  const [novaEtapa, setNovaEtapa] = useState("");
  const [novoChecklist, setNovoChecklist] = useState("");
  const [novoSla, setNovoSla] = useState("");
  const [novaMinuta, setNovaMinuta] = useState("");

  return (
    <div className="border border-hairline-strong bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink">
          {FORM_TYPE_LABELS[template.area]}{" "}
          <span className="font-mono text-[10px] uppercase text-gold">
            {FRENTE_TIPO_LABELS[template.tipo_frente]}
          </span>
        </p>
        <button
          type="button"
          onClick={onDeleteTemplate}
          className="text-[11px] text-error hover:underline"
        >
          excluir modelo
        </button>
      </div>

      <div className="mt-3 border-t border-hairline pt-3">
        {template.etapas.length === 0 && (
          <p className="text-xs text-ink-dim">Nenhuma etapa ainda.</p>
        )}
        {template.etapas.map((etapa, index) => (
          <div
            key={etapa.id}
            className="flex items-center gap-3 py-1.5 text-sm text-ink"
          >
            <span className="font-mono text-[10px] text-ink-dim">{index + 1}</span>
            <span className="flex-1">{etapa.nome}</span>
            {etapa.checklist.length > 0 && (
              <span className="font-mono text-[9px] text-ink-dim">
                {etapa.checklist.length} itens de checklist
              </span>
            )}
            {etapa.sla_dias != null && (
              <span className="font-mono text-[9px] text-warning">
                SLA {etapa.sla_dias}d
              </span>
            )}
            {etapa.minuta_url && (
              <a
                href={etapa.minuta_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] text-gold hover:underline"
              >
                minuta ↗
              </a>
            )}
            <button
              type="button"
              onClick={() => onDeleteEtapa(etapa.id)}
              className="text-[10px] text-error hover:underline"
            >
              excluir
            </button>
          </div>
        ))}
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            type="text"
            value={novaEtapa}
            onChange={(e) => setNovaEtapa(e.target.value)}
            placeholder="Nova etapa..."
            className="min-w-[140px] flex-1 border border-hairline-strong bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-gold"
          />
          <input
            type="text"
            value={novoChecklist}
            onChange={(e) => setNovoChecklist(e.target.value)}
            placeholder="Checklist, separado por vírgula (opcional)"
            className="min-w-[200px] flex-1 border border-hairline-strong bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-gold"
          />
          <input
            type="number"
            min={0}
            value={novoSla}
            onChange={(e) => setNovoSla(e.target.value)}
            placeholder="SLA (dias)"
            className="w-24 border border-hairline-strong bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-gold"
          />
          <input
            type="text"
            value={novaMinuta}
            onChange={(e) => setNovaMinuta(e.target.value)}
            placeholder="Link da minuta (opcional)"
            className="min-w-[160px] flex-1 border border-hairline-strong bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => {
              if (!novaEtapa.trim()) return;
              const checklist = novoChecklist
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
              onAddEtapa(
                novaEtapa.trim(),
                checklist,
                novoSla.trim() ? Number(novoSla) : null,
                novaMinuta.trim() || null,
              );
              setNovaEtapa("");
              setNovoChecklist("");
              setNovoSla("");
              setNovaMinuta("");
            }}
            className="border border-hairline-strong px-3 py-1 text-xs text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
          >
            + Etapa
          </button>
        </div>
      </div>
    </div>
  );
}

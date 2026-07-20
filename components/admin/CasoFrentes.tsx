"use client";

import { useState } from "react";
import { Eye, EyeOff, Search, Lock, ListChecks } from "lucide-react";
import type { Frente, FrenteInput, FrenteStatus, FrenteTipo } from "@/lib/db-frentes";
import { FrenteEtapasStepper } from "@/components/admin/FrenteEtapasStepper";
import {
  FRENTE_STATUS_COLORS,
  FRENTE_STATUS_LABELS,
  FRENTE_TIPO_LABELS,
} from "@/lib/admin-labels";

function comunicaPjeUrl(numeroProcesso: string): string {
  const digits = numeroProcesso.replace(/\D/g, "");
  return `https://comunica.pje.jus.br/consulta?numeroProcesso=${digits}`;
}

interface FrenteFormState {
  tipo: FrenteTipo;
  orgao: string;
  numeroProcesso: string;
  tribunal: string;
  vara: string;
  comarca: string;
  classeProcessual: string;
  assunto: string;
  poloAtivo: string;
  poloPassivo: string;
  valorCausa: string;
  dataDistribuicao: string;
  ultimaMovimentacao: string;
  ultimaMovimentacaoEm: string;
  etiquetas: string;
  segredoJustica: boolean;
}

const EMPTY_FORM: FrenteFormState = {
  tipo: "extrajudicial",
  orgao: "",
  numeroProcesso: "",
  tribunal: "",
  vara: "",
  comarca: "",
  classeProcessual: "",
  assunto: "",
  poloAtivo: "",
  poloPassivo: "",
  valorCausa: "",
  dataDistribuicao: "",
  ultimaMovimentacao: "",
  ultimaMovimentacaoEm: "",
  etiquetas: "",
  segredoJustica: false,
};

function toFrenteInput(form: FrenteFormState, status: FrenteStatus): FrenteInput {
  return {
    tipo: form.tipo,
    orgao: form.orgao,
    numero_processo: form.numeroProcesso,
    status,
    tribunal: form.tribunal.trim() || null,
    vara: form.vara.trim() || null,
    comarca: form.comarca.trim() || null,
    classe_processual: form.classeProcessual.trim() || null,
    assunto: form.assunto.trim() || null,
    polo_ativo: form.poloAtivo.trim() || null,
    polo_passivo: form.poloPassivo.trim() || null,
    valor_causa: form.valorCausa.trim() ? Number(form.valorCausa) : null,
    data_distribuicao: form.dataDistribuicao.trim() || null,
    ultima_movimentacao: form.ultimaMovimentacao.trim() || null,
    ultima_movimentacao_em: form.ultimaMovimentacaoEm.trim() || null,
    etiquetas: form.etiquetas
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    segredo_justica: form.segredoJustica,
  };
}

const inputClass =
  "mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold";
const labelClass = "font-eyebrow text-[10px] text-ink-dim";

function CamposProcessuais({
  form,
  onChange,
}: {
  form: FrenteFormState;
  onChange: (patch: Partial<FrenteFormState>) => void;
}) {
  return (
    <div className="space-y-3 border-t border-hairline pt-3">
      <div className="flex items-center justify-between gap-3">
        <label className={labelClass}>Número do processo</label>
        {form.numeroProcesso.replace(/\D/g, "") && (
          <a
            href={comunicaPjeUrl(form.numeroProcesso)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-gold transition-colors duration-150 hover:text-gold-bright"
          >
            <Search size={12} /> Consultar no Comunica PJe
          </a>
        )}
      </div>
      <input
        type="text"
        value={form.numeroProcesso}
        onChange={(e) => onChange({ numeroProcesso: e.target.value })}
        placeholder="0000000-00.0000.0.00.0000"
        className="w-full border border-hairline-strong bg-bg px-3 py-2 font-mono text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
      />

      <label className="flex items-center gap-2 pt-1 text-xs text-ink-dim">
        <input
          type="checkbox"
          checked={form.segredoJustica}
          onChange={(e) => onChange({ segredoJustica: e.target.checked })}
        />
        Segredo de Justiça
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Tribunal</label>
          <input
            type="text"
            value={form.tribunal}
            onChange={(e) => onChange({ tribunal: e.target.value })}
            placeholder="ex.: TJPA"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Vara</label>
          <input
            type="text"
            value={form.vara}
            onChange={(e) => onChange({ vara: e.target.value })}
            placeholder="ex.: 3ª Vara Cível"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Comarca</label>
          <input
            type="text"
            value={form.comarca}
            onChange={(e) => onChange({ comarca: e.target.value })}
            placeholder="ex.: Redenção/PA"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Classe processual</label>
          <input
            type="text"
            value={form.classeProcessual}
            onChange={(e) => onChange({ classeProcessual: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Assunto</label>
        <input
          type="text"
          value={form.assunto}
          onChange={(e) => onChange({ assunto: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Polo ativo</label>
          <input
            type="text"
            value={form.poloAtivo}
            onChange={(e) => onChange({ poloAtivo: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Polo passivo</label>
          <input
            type="text"
            value={form.poloPassivo}
            onChange={(e) => onChange({ poloPassivo: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Valor da causa</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.valorCausa}
            onChange={(e) => onChange({ valorCausa: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Data de distribuição</label>
          <input
            type="date"
            value={form.dataDistribuicao}
            onChange={(e) => onChange({ dataDistribuicao: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className={labelClass}>Última movimentação</label>
          <input
            type="text"
            value={form.ultimaMovimentacao}
            onChange={(e) => onChange({ ultimaMovimentacao: e.target.value })}
            placeholder='ex.: "Audiência de conciliação designada"'
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Data</label>
          <input
            type="date"
            value={form.ultimaMovimentacaoEm}
            onChange={(e) => onChange({ ultimaMovimentacaoEm: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Etiquetas (separadas por vírgula)</label>
        <input
          type="text"
          value={form.etiquetas}
          onChange={(e) => onChange({ etiquetas: e.target.value })}
          placeholder="consumidor, urgente-cliente-vip, recurso"
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function CasoFrentes({
  casoId,
  initialFrentes,
}: {
  casoId: string;
  initialFrentes: Frente[];
}) {
  const [frentes, setFrentes] = useState(initialFrentes);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FrenteFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState<string | null>(null);
  const [visibilidadeSavingId, setVisibilidadeSavingId] = useState<string | null>(null);
  const [etapasAbertasId, setEtapasAbertasId] = useState<string | null>(null);

  function patchForm(patch: Partial<FrenteFormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleAddFrente() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/casos/${casoId}/frentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toFrenteInput(form, "aberta")),
      });
      const data = await res.json();
      if (res.ok && data.frente) {
        setFrentes((prev) => [data.frente, ...prev]);
        setForm(EMPTY_FORM);
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(frente: Frente, status: FrenteStatus) {
    setStatusSavingId(frente.id);
    try {
      const res = await fetch(
        `/api/admin/casos/${casoId}/frentes/${frente.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: frente.tipo,
            orgao: frente.orgao,
            numero_processo: frente.numero_processo,
            status,
            tribunal: frente.tribunal,
            vara: frente.vara,
            comarca: frente.comarca,
            classe_processual: frente.classe_processual,
            assunto: frente.assunto,
            polo_ativo: frente.polo_ativo,
            polo_passivo: frente.polo_passivo,
            valor_causa: frente.valor_causa,
            data_distribuicao: frente.data_distribuicao,
            ultima_movimentacao: frente.ultima_movimentacao,
            ultima_movimentacao_em: frente.ultima_movimentacao_em,
            etiquetas: frente.etiquetas,
            segredo_justica: frente.segredo_justica,
          }),
        },
      );
      const data = await res.json();
      if (res.ok && data.frente) {
        setFrentes((prev) =>
          prev.map((f) => (f.id === frente.id ? data.frente : f)),
        );
      }
    } finally {
      setStatusSavingId(null);
    }
  }

  async function handleToggleVisibilidade(frente: Frente) {
    setVisibilidadeSavingId(frente.id);
    try {
      const res = await fetch(
        `/api/admin/casos/${casoId}/frentes/${frente.id}/visibilidade`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visivel_cliente: !frente.visivel_cliente }),
        },
      );
      const data = await res.json();
      if (res.ok && data.frente) {
        setFrentes((prev) =>
          prev.map((f) => (f.id === frente.id ? data.frente : f)),
        );
      }
    } finally {
      setVisibilidadeSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
      <div className="mt-2 border-t border-hairline pt-6">
      <div className="flex items-center justify-between">
        <span className="font-eyebrow text-[10px] text-ink-dim">
          Frentes do caso
        </span>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-xs text-gold transition-colors duration-150 hover:underline"
        >
          {showForm ? "Cancelar" : "+ Nova frente"}
        </button>
      </div>

      {showForm && (
        <div className="mt-3 space-y-3 border border-hairline-strong bg-surface p-4">
          <div>
            <label className={labelClass}>Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => patchForm({ tipo: e.target.value as FrenteTipo })}
              className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
            >
              {(Object.keys(FRENTE_TIPO_LABELS) as FrenteTipo[]).map((t) => (
                <option key={t} value={t}>
                  {FRENTE_TIPO_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Órgão / Tribunal</label>
            <input
              type="text"
              value={form.orgao}
              onChange={(e) => patchForm({ orgao: e.target.value })}
              placeholder="INPI, TJPA, TRF1..."
              className={inputClass}
            />
          </div>

          {form.tipo === "judicial" ? (
            <CamposProcessuais form={form} onChange={patchForm} />
          ) : (
            <div>
              <label className={labelClass}>Número do processo</label>
              <input
                type="text"
                value={form.numeroProcesso}
                onChange={(e) => patchForm({ numeroProcesso: e.target.value })}
                className={inputClass}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleAddFrente}
            disabled={saving}
            className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar frente"}
          </button>
        </div>
      )}

      <div className="mt-3 border border-hairline">
        {frentes.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-ink-dim">
            Nenhuma frente aberta ainda.
          </p>
        )}
        {frentes.map((frente, index) => (
          <div
            key={frente.id}
            className={index !== frentes.length - 1 ? "border-b border-hairline" : ""}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-ink">
                  {FRENTE_TIPO_LABELS[frente.tipo]}
                  {frente.orgao ? ` — ${frente.orgao}` : ""}
                  {frente.segredo_justica && (
                    <span className="flex items-center gap-1 border border-warning px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-warning">
                      <Lock size={10} /> Segredo de Justiça
                    </span>
                  )}
                </p>
                {frente.numero_processo && (
                  <p className="flex items-center gap-2 font-mono text-xs text-ink-dim">
                    {frente.numero_processo}
                    {frente.tipo === "judicial" && (
                      <a
                        href={comunicaPjeUrl(frente.numero_processo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Consultar no Comunica PJe"
                        className="text-gold transition-colors duration-150 hover:text-gold-bright"
                      >
                        <Search size={11} />
                      </a>
                    )}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEtapasAbertasId((prev) => (prev === frente.id ? null : frente.id))
                  }
                  title="Etapas do processo"
                  className={`transition-colors duration-150 ${
                    etapasAbertasId === frente.id
                      ? "text-gold"
                      : "text-ink-dim hover:text-gold"
                  }`}
                >
                  <ListChecks size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleVisibilidade(frente)}
                  disabled={visibilidadeSavingId === frente.id}
                  title={
                    frente.visivel_cliente
                      ? "Visível pro cliente — clique para ocultar"
                      : "Oculto do cliente — clique para mostrar"
                  }
                  className={`transition-colors duration-150 disabled:opacity-50 ${
                    frente.visivel_cliente
                      ? "text-success hover:text-ink-dim"
                      : "text-ink-dim hover:text-success"
                  }`}
                >
                  {frente.visivel_cliente ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <select
                  value={frente.status}
                  disabled={statusSavingId === frente.id}
                  onChange={(e) =>
                    handleStatusChange(frente, e.target.value as FrenteStatus)
                  }
                  className={`border bg-transparent px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide disabled:opacity-50 ${FRENTE_STATUS_COLORS[frente.status]}`}
                >
                  {(Object.keys(FRENTE_STATUS_LABELS) as FrenteStatus[]).map(
                    (status) => (
                      <option key={status} value={status}>
                        {FRENTE_STATUS_LABELS[status]}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
            {etapasAbertasId === frente.id && (
              <FrenteEtapasStepper casoId={casoId} frenteId={frente.id} />
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { Paperclip, Download, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import type { CasoHistoricoEntry } from "@/lib/db-caso-historico";
import type { Atividade } from "@/lib/db-atividades";
import type { Documento } from "@/lib/db-documentos";
import { ATIVIDADE_TIPO_LABELS } from "@/lib/admin-labels";
import { isAudiencia } from "@/lib/atividades-utils";

type TimelineFiltro = "tudo" | "anamnese" | "atividade" | "documento";

interface TimelineItem {
  kind: "anamnese" | "atividade" | "documento";
  id: string;
  data: string;
  audiencia?: boolean;
}

interface AnamneseItem extends TimelineItem {
  kind: "anamnese";
  entry: CasoHistoricoEntry;
  texto: string;
  autor: string;
  isFirst: boolean;
  retificacao: CasoHistoricoEntry | null;
}

interface AtividadeItem extends TimelineItem {
  kind: "atividade";
  atividade: Atividade;
}

interface DocumentoItem extends TimelineItem {
  kind: "documento";
  documento: Documento;
}

function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Belem",
  }).format(new Date(dateString));
}

function formatTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILTROS: { key: TimelineFiltro; label: string }[] = [
  { key: "tudo", label: "Tudo" },
  { key: "anamnese", label: "Anamnese" },
  { key: "atividade", label: "Atividades" },
  { key: "documento", label: "Documentos" },
];

export function CasoTimeline({
  casoId,
  initialHistorico,
  initialAtividades,
  initialDocumentos,
}: {
  casoId: string;
  initialHistorico: CasoHistoricoEntry[];
  initialAtividades: Atividade[];
  initialDocumentos: Documento[];
}) {
  const [historico, setHistorico] = useState(initialHistorico);
  const [atividades] = useState(initialAtividades);
  const [documentos, setDocumentos] = useState(initialDocumentos);
  const [filtro, setFiltro] = useState<TimelineFiltro>("tudo");

  const [texto, setTexto] = useState("");
  const [descricaoArquivo, setDescricaoArquivo] = useState("");
  const [marcoAtivo, setMarcoAtivo] = useState(false);
  const [marcoCliente, setMarcoCliente] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [retificandoId, setRetificandoId] = useState<string | null>(null);
  const [textoRetificacao, setTextoRetificacao] = useState("");
  const [savingRetificacao, setSavingRetificacao] = useState(false);

  const [visibilidadeSavingId, setVisibilidadeSavingId] = useState<string | null>(null);

  const [editandoMarcoId, setEditandoMarcoId] = useState<string | null>(null);
  const [marcoEditAtivo, setMarcoEditAtivo] = useState(false);
  const [marcoEditTexto, setMarcoEditTexto] = useState("");
  const [savingMarcoId, setSavingMarcoId] = useState<string | null>(null);

  const items = useMemo<(AnamneseItem | AtividadeItem | DocumentoItem)[]>(() => {
    const retificacoesPorAlvo = new Map<string, CasoHistoricoEntry>();
    for (const entry of historico) {
      if (entry.retifica_id) retificacoesPorAlvo.set(entry.retifica_id, entry);
    }

    const entriesOriginais = historico
      .filter((entry) => !entry.retifica_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const anamneseItems: AnamneseItem[] = entriesOriginais.map((entry, index) => ({
      kind: "anamnese",
      id: entry.id,
      entry,
      data: entry.created_at,
      texto: entry.texto,
      autor: entry.autor,
      isFirst: index === 0,
      retificacao: retificacoesPorAlvo.get(entry.id) ?? null,
    }));

    const atividadeItems: AtividadeItem[] = atividades
      .filter((a) => a.status === "concluido")
      .map((a) => ({
        kind: "atividade",
        id: a.id,
        data: a.concluido_em ?? a.data,
        atividade: a,
        audiencia: isAudiencia(a),
      }));

    const documentoItems: DocumentoItem[] = documentos.map((d) => ({
      kind: "documento",
      id: d.id,
      data: d.created_at,
      documento: d,
    }));

    return [...anamneseItems, ...atividadeItems, ...documentoItems].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    );
  }, [historico, atividades, documentos]);

  const filtered = items.filter((item) => filtro === "tudo" || item.kind === filtro);

  async function handleAddTexto() {
    if (!texto.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/casos/${casoId}/historico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: texto.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setHistorico((prev) => [...prev, data.entry]);
      setTexto("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleSalvarRetificacao(entryId: string) {
    if (!textoRetificacao.trim()) return;
    setSavingRetificacao(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/casos/${casoId}/historico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: textoRetificacao.trim(),
          retifica_id: entryId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setHistorico((prev) => [...prev, data.entry]);
      setTextoRetificacao("");
      setRetificandoId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSavingRetificacao(false);
    }
  }

  async function handleToggleVisivelCliente(entry: CasoHistoricoEntry) {
    setVisibilidadeSavingId(entry.id);
    try {
      const res = await fetch(
        `/api/admin/casos/${casoId}/historico/${entry.id}/visibilidade`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visivel_cliente: !entry.visivel_cliente }),
        },
      );
      const data = await res.json();
      if (res.ok && data.entry) {
        setHistorico((prev) =>
          prev.map((h) => (h.id === entry.id ? data.entry : h)),
        );
      }
    } finally {
      setVisibilidadeSavingId(null);
    }
  }

  function handleAbrirEdicaoMarco(documento: Documento) {
    setEditandoMarcoId(documento.id);
    setMarcoEditAtivo(!!documento.marco_cliente);
    setMarcoEditTexto(documento.marco_cliente ?? "");
  }

  async function handleSalvarMarco(documento: Documento) {
    setSavingMarcoId(documento.id);
    try {
      const res = await fetch(`/api/admin/documentos/${documento.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marco_cliente: marcoEditAtivo ? marcoEditTexto.trim() : null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.documento) {
        setDocumentos((prev) =>
          prev.map((d) => (d.id === documento.id ? data.documento : d)),
        );
        setEditandoMarcoId(null);
      }
    } finally {
      setSavingMarcoId(null);
    }
  }

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("caso_id", casoId);
    formData.append("file", file);
    if (descricaoArquivo.trim()) formData.append("descricao", descricaoArquivo.trim());
    if (marcoAtivo && marcoCliente.trim()) {
      formData.append("marco_cliente", marcoCliente.trim());
    }

    try {
      const res = await fetch("/api/admin/documentos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");
      setDocumentos((prev) => [data.documento, ...prev]);
      setDescricaoArquivo("");
      setMarcoAtivo(false);
      setMarcoCliente("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(documento: Documento) {
    const res = await fetch(`/api/admin/documentos/${documento.id}/download`);
    const data = await res.json();
    if (res.ok && data.url) window.open(data.url, "_blank", "noopener,noreferrer");
  }

  async function handleDeleteDocumento(documento: Documento) {
    if (!confirm(`Excluir "${documento.nome_arquivo}"? Essa ação não pode ser desfeita.`)) return;
    setDocumentos((prev) => prev.filter((d) => d.id !== documento.id));
    await fetch(`/api/admin/documentos/${documento.id}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
      <div className="mt-2 border-t border-hairline pt-6">
        <span className="font-eyebrow text-[10px] text-ink-dim">Linha do tempo</span>
        <p className="mt-1 text-xs text-ink-dim">
          Anamnese, atividades concluídas e documentos anexados, tudo junto, mais
          recente primeiro.
        </p>

        <div className="mt-3 space-y-3 border border-hairline-strong bg-surface p-4">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva uma atualização..."
            rows={3}
            className="w-full resize-none border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddTexto}
              disabled={saving || !texto.trim()}
              className="border border-gold bg-gold px-4 py-1.5 text-xs text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
            >
              {saving ? "Salvando..." : "+ Adicionar"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
            <Paperclip size={13} className="text-ink-dim" />
            <input
              ref={fileInputRef}
              type="file"
              className="min-w-[160px] flex-1 text-xs text-ink-dim file:mr-2 file:border file:border-hairline-strong file:bg-bg file:px-2 file:py-1 file:text-xs file:text-ink-dim"
            />
            <input
              type="text"
              value={descricaoArquivo}
              onChange={(e) => setDescricaoArquivo(e.target.value)}
              placeholder="Descrição (opcional)"
              className="min-w-[140px] flex-1 border border-hairline-strong bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="border border-hairline-strong px-3 py-1 text-xs text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold disabled:opacity-50"
            >
              {uploading ? "Enviando…" : "Anexar arquivo"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pl-5">
            <label className="flex items-center gap-1.5 text-[11px] text-ink-dim">
              <input
                type="checkbox"
                checked={marcoAtivo}
                onChange={(e) => setMarcoAtivo(e.target.checked)}
              />
              Marcar como marco pro relatório do cliente
            </label>
            {marcoAtivo && (
              <input
                type="text"
                value={marcoCliente}
                onChange={(e) => setMarcoCliente(e.target.value)}
                placeholder='ex.: "Petição inicial protocolada"'
                className="min-w-[180px] flex-1 border border-hairline-strong bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-gold"
              />
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs text-error">
              {error}
            </p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltro(f.key)}
              className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors duration-150 ${
                filtro === f.key
                  ? "border-gold-bright bg-gold-bright text-bg"
                  : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-3 border border-hairline">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-dim">
              Nenhuma entrada ainda.
            </p>
          )}
          {filtered.map((item, index) => (
            <div
              key={`${item.kind}-${item.id}`}
              className={`px-4 py-3 ${
                index !== filtered.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              {item.kind === "anamnese" && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wide ${
                        item.retificacao
                          ? "text-ink-dim line-through"
                          : item.isFirst
                            ? "text-gold"
                            : "text-wine"
                      }`}
                    >
                      {item.isFirst ? "Anamnese" : "Atualização"}
                    </span>
                    {item.retificacao && (
                      <span className="border border-error px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-error">
                        Cancelada
                      </span>
                    )}
                    <span className="text-xs text-ink-dim">
                      {formatDateTime(item.data)}
                    </span>
                    <span className="text-xs text-ink-dim">· {item.autor}</span>
                    {!item.retificacao && (
                      <button
                        type="button"
                        onClick={() => handleToggleVisivelCliente(item.entry)}
                        disabled={visibilidadeSavingId === item.entry.id}
                        title={
                          item.entry.visivel_cliente
                            ? "Visível pro cliente — clique para ocultar"
                            : "Oculto do cliente — clique para mostrar"
                        }
                        className={`ml-auto flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide transition-colors duration-150 disabled:opacity-50 ${
                          item.entry.visivel_cliente
                            ? "text-success hover:text-ink-dim"
                            : "text-ink-dim hover:text-success"
                        }`}
                      >
                        {item.entry.visivel_cliente ? (
                          <Eye size={12} />
                        ) : (
                          <EyeOff size={12} />
                        )}
                        {item.entry.visivel_cliente ? "Visível pro cliente" : "Oculto do cliente"}
                      </button>
                    )}
                  </div>
                  <p
                    className={`mt-1.5 whitespace-pre-wrap text-sm ${
                      item.retificacao ? "text-ink-dim line-through" : "text-ink"
                    }`}
                  >
                    {item.texto}
                  </p>

                  {item.retificacao ? (
                    <div className="mt-3 border-l-2 border-error pl-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wide text-error">
                          Retificação
                        </span>
                        <span className="text-xs text-ink-dim">
                          {formatDateTime(item.retificacao.created_at)}
                        </span>
                        <span className="text-xs text-ink-dim">
                          · {item.retificacao.autor}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
                        {item.retificacao.texto}
                      </p>
                    </div>
                  ) : retificandoId === item.id ? (
                    <div className="mt-3 space-y-2 border-l-2 border-hairline-strong pl-3">
                      <textarea
                        value={textoRetificacao}
                        onChange={(e) => setTextoRetificacao(e.target.value)}
                        placeholder="Explique a retificação..."
                        rows={2}
                        className="w-full resize-none border border-hairline-strong bg-bg px-2 py-1.5 text-xs text-ink outline-none focus:border-gold"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSalvarRetificacao(item.id)}
                          disabled={savingRetificacao || !textoRetificacao.trim()}
                          className="border border-error px-3 py-1 text-[11px] text-error transition-colors duration-150 hover:bg-error hover:text-bg disabled:opacity-50"
                        >
                          {savingRetificacao ? "Salvando..." : "Confirmar cancelamento"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRetificandoId(null);
                            setTextoRetificacao("");
                          }}
                          className="px-3 py-1 text-[11px] text-ink-dim hover:text-ink"
                        >
                          Voltar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRetificandoId(item.id)}
                      className="mt-2 text-[11px] text-ink-dim underline decoration-dotted hover:text-error"
                    >
                      Cancelar / retificar
                    </button>
                  )}
                </>
              )}

              {item.kind === "atividade" && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wide ${
                        item.audiencia ? "font-bold text-audiencia" : "text-success"
                      }`}
                    >
                      {item.audiencia ? "⚠ " : ""}
                      {ATIVIDADE_TIPO_LABELS[item.atividade.tipo]} concluída
                    </span>
                    <span className="text-xs text-ink-dim">
                      {formatDateTime(item.data)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink">{item.atividade.titulo}</p>
                </>
              )}

              {item.kind === "documento" && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wide text-wine">
                        Documento anexado
                      </span>
                      {item.documento.marco_cliente && (
                        <span className="border border-gold px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-gold">
                          Marco: {item.documento.marco_cliente}
                        </span>
                      )}
                      <span className="text-xs text-ink-dim">
                        {formatDateTime(item.data)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleAbrirEdicaoMarco(item.documento)}
                        aria-label={`Editar marco de ${item.documento.nome_arquivo}`}
                        className="text-ink-dim transition-colors duration-150 hover:text-gold"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(item.documento)}
                        aria-label={`Baixar ${item.documento.nome_arquivo}`}
                        className="text-gold transition-colors duration-150 hover:text-gold-bright"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocumento(item.documento)}
                        aria-label={`Excluir ${item.documento.nome_arquivo}`}
                        className="text-error transition-colors duration-150 hover:text-error"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm text-ink">
                    {item.documento.descricao || item.documento.nome_arquivo}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ink-dim">
                    📄 {item.documento.nome_arquivo} ·{" "}
                    {formatTamanho(item.documento.tamanho)}
                  </p>

                  {editandoMarcoId === item.documento.id && (
                    <div className="mt-3 space-y-2 border-l-2 border-hairline-strong pl-3">
                      <label className="flex items-center gap-1.5 text-[11px] text-ink-dim">
                        <input
                          type="checkbox"
                          checked={marcoEditAtivo}
                          onChange={(e) => setMarcoEditAtivo(e.target.checked)}
                        />
                        Marcar como marco pro relatório do cliente
                      </label>
                      {marcoEditAtivo && (
                        <input
                          type="text"
                          value={marcoEditTexto}
                          onChange={(e) => setMarcoEditTexto(e.target.value)}
                          placeholder='ex.: "Petição inicial protocolada"'
                          className="w-full border border-hairline-strong bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-gold"
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSalvarMarco(item.documento)}
                          disabled={
                            savingMarcoId === item.documento.id ||
                            (marcoEditAtivo && !marcoEditTexto.trim())
                          }
                          className="border border-gold px-3 py-1 text-[11px] text-gold transition-colors duration-150 hover:bg-gold hover:text-bg disabled:opacity-50"
                        >
                          {savingMarcoId === item.documento.id ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditandoMarcoId(null)}
                          className="px-3 py-1 text-[11px] text-ink-dim hover:text-ink"
                        >
                          Voltar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

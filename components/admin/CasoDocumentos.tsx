"use client";

import { useRef, useState } from "react";
import { Paperclip, Download, Trash2 } from "lucide-react";
import type { Documento } from "@/lib/db-documentos";
import { formatDate } from "@/lib/format";

function formatTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CasoDocumentos({
  casoId,
  initialDocumentos,
}: {
  casoId: string;
  initialDocumentos: Documento[];
}) {
  const [documentos, setDocumentos] = useState(initialDocumentos);
  const [descricao, setDescricao] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("caso_id", casoId);
    formData.append("file", file);
    if (descricao.trim()) formData.append("descricao", descricao.trim());

    try {
      const res = await fetch("/api/admin/documentos", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");
      setDocumentos((prev) => [data.documento, ...prev]);
      setDescricao("");
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
    if (res.ok && data.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
    }
  }

  async function handleDelete(documento: Documento) {
    if (!confirm(`Excluir "${documento.nome_arquivo}"? Essa ação não pode ser desfeita.`)) return;
    setDocumentos((prev) => prev.filter((d) => d.id !== documento.id));
    await fetch(`/api/admin/documentos/${documento.id}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
      <div className="mt-2 border-t border-hairline pt-6">
        <span className="font-eyebrow text-[10px] text-ink-dim">Documentos</span>

        <div className="mt-3 flex flex-wrap gap-2 border border-hairline-strong bg-surface p-4">
          <input
            ref={fileInputRef}
            type="file"
            className="min-w-[200px] flex-1 text-xs text-ink-dim file:mr-3 file:border file:border-hairline-strong file:bg-bg file:px-3 file:py-1.5 file:text-xs file:text-ink-dim"
          />
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição (opcional)"
            className="min-w-[160px] flex-1 border border-hairline-strong bg-bg px-3 py-1.5 text-xs text-ink outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="border border-gold bg-gold px-3.5 py-1.5 text-xs text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
          >
            {uploading ? "Enviando…" : "Enviar"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-xs text-error">
            {error}
          </p>
        )}

        <div className="mt-3 border border-hairline">
          {documentos.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-dim">
              Nenhum documento anexado ainda.
            </p>
          )}
          {documentos.map((documento, index) => (
            <div
              key={documento.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
                index !== documentos.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <div className="flex min-w-0 items-start gap-2">
                <Paperclip size={14} className="mt-0.5 shrink-0 text-ink-dim" />
                <div className="min-w-0">
                  <p className="truncate text-ink">{documento.nome_arquivo}</p>
                  <p className="font-mono text-xs text-ink-dim">
                    {formatTamanho(documento.tamanho)} · {formatDate(documento.created_at)}
                    {documento.descricao ? ` · ${documento.descricao}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload(documento)}
                  aria-label={`Baixar ${documento.nome_arquivo}`}
                  className="text-gold transition-colors duration-150 hover:text-gold-bright"
                >
                  <Download size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(documento)}
                  aria-label={`Excluir ${documento.nome_arquivo}`}
                  className="text-error transition-colors duration-150 hover:text-error"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

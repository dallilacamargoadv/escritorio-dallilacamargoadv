"use client";

import { useRef, useState } from "react";
import { Plus, X, FileText, Sheet, Presentation, Video, FileType, Link2 } from "lucide-react";
import type { LinkGrupo, LinkItem } from "@/lib/db-links";
import {
  detectLinkTipo,
  getEmbedUrl,
  getYoutubeThumbnailUrl,
  isEmbeddable,
  LINK_TIPO_LABELS,
  type LinkTipo,
} from "@/lib/link-tipo";

const DEBOUNCE_MS = 600;

const TIPO_ICON: Record<LinkTipo, React.ComponentType<{ size?: number }>> = {
  google_docs: FileText,
  google_sheets: Sheet,
  google_slides: Presentation,
  youtube: Video,
  pdf: FileType,
  generico: Link2,
};

function useDebouncedSave(callback: (value: string) => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (value: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(value), DEBOUNCE_MS);
  };
}

function LinkCard({
  link,
  onDelete,
  onOpenPreview,
}: {
  link: LinkItem;
  onDelete: () => void;
  onOpenPreview: () => void;
}) {
  const Icon = TIPO_ICON[link.tipo];
  const thumbnail = link.tipo === "youtube" ? getYoutubeThumbnailUrl(link.url) : null;
  const embeddable = isEmbeddable(link.tipo);

  const preview = (
    <div className="relative flex aspect-video items-center justify-center bg-surface">
      <span className="absolute left-1.5 top-1.5 border border-hairline-strong bg-bg px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide text-ink-dim">
        {LINK_TIPO_LABELS[link.tipo]}
      </span>
      {thumbnail ? (
        <img src={thumbnail} alt="" className="h-full w-full object-cover" />
      ) : (
        <Icon size={22} />
      )}
    </div>
  );

  const info = (
    <div className="px-2.5 py-2">
      <p className="line-clamp-2 text-[11.5px] leading-tight text-ink">{link.titulo}</p>
      <p className="mt-0.5 truncate font-mono text-[9px] text-ink-dim">
        {new URL(link.url).hostname.replace(/^www\./, "")}
      </p>
    </div>
  );

  return (
    <div className="group relative flex flex-col overflow-hidden border border-hairline bg-bg-alt transition-colors duration-150 hover:border-gold">
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-1.5 top-1.5 z-10 border border-hairline-strong bg-bg p-0.5 text-ink-dim opacity-0 transition-opacity duration-150 hover:text-error group-hover:opacity-100"
        title="Excluir link"
      >
        <X size={11} />
      </button>
      {embeddable ? (
        <button type="button" onClick={onOpenPreview} className="flex flex-col text-left">
          {preview}
          {info}
        </button>
      ) : (
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col">
          {preview}
          {info}
        </a>
      )}
    </div>
  );
}

function AddLinkCard({ onAdd }: { onAdd: (url: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!url.trim() || loading) return;
    setLoading(true);
    await onAdd(url.trim());
    setUrl("");
    setLoading(false);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex aspect-video flex-col items-center justify-center gap-1 border border-dashed border-hairline-strong text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
      >
        <Plus size={16} />
        <span className="font-mono text-[10px]">link</span>
      </button>
    );
  }

  return (
    <div className="flex aspect-video flex-col justify-center gap-2 border border-hairline-strong bg-bg-alt p-2.5">
      <input
        autoFocus
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") {
            setEditing(false);
            setUrl("");
          }
        }}
        placeholder="Cole a URL…"
        disabled={loading}
        className="w-full border border-hairline-strong bg-bg px-2 py-1.5 text-xs text-ink outline-none focus:border-gold disabled:opacity-50"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !url.trim()}
        className="border border-gold px-2 py-1 font-mono text-[10px] text-gold transition-colors duration-150 hover:bg-gold hover:text-bg disabled:opacity-50"
      >
        {loading ? "Buscando…" : "Adicionar"}
      </button>
    </div>
  );
}

function GrupoBloco({
  grupo,
  onRenameGrupo,
  onDeleteGrupo,
  onAddLink,
  onDeleteLink,
  onOpenPreview,
}: {
  grupo: LinkGrupo;
  onRenameGrupo: (titulo: string) => void;
  onDeleteGrupo: () => void;
  onAddLink: (url: string) => void;
  onDeleteLink: (linkId: string) => void;
  onOpenPreview: (link: LinkItem) => void;
}) {
  const [titulo, setTitulo] = useState(grupo.titulo);
  const debouncedSave = useDebouncedSave(onRenameGrupo);

  return (
    <div className="mt-7 first:mt-0">
      <div className="group/head mb-2.5 flex items-center justify-between gap-2">
        <input
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            debouncedSave(e.target.value);
          }}
          className="border-b border-transparent bg-transparent font-display text-[15px] italic text-ink outline-none transition-colors duration-150 hover:border-hairline-strong focus:border-gold"
        />
        <button
          type="button"
          onClick={onDeleteGrupo}
          className="font-mono text-[10px] text-ink-dim opacity-0 transition-opacity duration-150 hover:text-error group-hover/head:opacity-100"
        >
          excluir grupo
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {grupo.links.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            onDelete={() => onDeleteLink(link.id)}
            onOpenPreview={() => onOpenPreview(link)}
          />
        ))}
        <AddLinkCard onAdd={onAddLink} />
      </div>
    </div>
  );
}

export function LinksHub({ initialGrupos }: { initialGrupos: LinkGrupo[] }) {
  const [grupos, setGrupos] = useState(initialGrupos);
  const [preview, setPreview] = useState<LinkItem | null>(null);
  const [addingGrupo, setAddingGrupo] = useState(false);

  async function handleAddGrupo() {
    if (addingGrupo) return;
    setAddingGrupo(true);
    try {
      const res = await fetch("/api/admin/link-grupos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: "Novo grupo" }),
      });
      const data = await res.json();
      if (res.ok && data.grupo) {
        setGrupos((prev) => [...prev, data.grupo]);
      }
    } finally {
      setAddingGrupo(false);
    }
  }

  async function handleRenameGrupo(grupoId: string, titulo: string) {
    if (!titulo.trim()) return;
    await fetch(`/api/admin/link-grupos/${grupoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo }),
    });
  }

  async function handleDeleteGrupo(grupoId: string) {
    setGrupos((prev) => prev.filter((g) => g.id !== grupoId));
    await fetch(`/api/admin/link-grupos/${grupoId}`, { method: "DELETE" });
  }

  async function handleAddLink(grupoId: string, url: string) {
    let titulo = url;
    let tipo = detectLinkTipo(url);
    try {
      const metaRes = await fetch("/api/admin/links/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const meta = await metaRes.json();
      if (metaRes.ok) {
        titulo = meta.titulo ?? titulo;
        tipo = meta.tipo ?? tipo;
      }
    } catch {
      // segue com o fallback
    }

    const res = await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grupo_id: grupoId, url, titulo, tipo }),
    });
    const data = await res.json();
    if (res.ok && data.link) {
      setGrupos((prev) =>
        prev.map((g) =>
          g.id === grupoId ? { ...g, links: [...g.links, data.link] } : g,
        ),
      );
    }
  }

  async function handleDeleteLink(grupoId: string, linkId: string) {
    setGrupos((prev) =>
      prev.map((g) =>
        g.id === grupoId
          ? { ...g, links: g.links.filter((l) => l.id !== linkId) }
          : g,
      ),
    );
    await fetch(`/api/admin/links/${linkId}`, { method: "DELETE" });
  }

  const embedUrl = preview ? getEmbedUrl(preview.url, preview.tipo) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Hub de Links</h1>
          <p className="font-mono text-xs text-ink-dim">
            Grupos e links salvos do escritório
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddGrupo}
          disabled={addingGrupo}
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
        >
          + Novo grupo
        </button>
      </div>

      {grupos.length === 0 && (
        <p className="mt-10 text-center text-sm text-ink-dim">
          Nenhum grupo ainda. Crie o primeiro acima.
        </p>
      )}

      {grupos.map((grupo) => (
        <GrupoBloco
          key={grupo.id}
          grupo={grupo}
          onRenameGrupo={(titulo) => handleRenameGrupo(grupo.id, titulo)}
          onDeleteGrupo={() => handleDeleteGrupo(grupo.id)}
          onAddLink={(url) => handleAddLink(grupo.id, url)}
          onDeleteLink={(linkId) => handleDeleteLink(grupo.id, linkId)}
          onOpenPreview={setPreview}
        />
      ))}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setPreview(null)}
        >
          <div
            className="flex h-full max-h-[85vh] w-full max-w-4xl flex-col border border-hairline-strong bg-bg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
              <p className="truncate text-sm text-ink">{preview.titulo}</p>
              <div className="flex shrink-0 items-center gap-3">
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-gold hover:underline"
                >
                  abrir ↗
                </a>
                <button type="button" onClick={() => setPreview(null)} className="text-ink-dim hover:text-ink">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-surface">
              {embedUrl ? (
                <iframe src={embedUrl} className="h-full w-full" allowFullScreen title={preview.titulo} />
              ) : (
                <p className="p-6 text-sm text-ink-dim">Não foi possível gerar o preview.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

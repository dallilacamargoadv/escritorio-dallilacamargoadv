"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { DespesaCategoria } from "@/lib/db-despesa-categorias";

function CategoriaBloco({
  categoria,
  onRenameCategoria,
  onDeleteCategoria,
  onAddSubcategoria,
  onDeleteSubcategoria,
}: {
  categoria: DespesaCategoria;
  onRenameCategoria: (nome: string) => void;
  onDeleteCategoria: () => void;
  onAddSubcategoria: (nome: string) => void;
  onDeleteSubcategoria: (subId: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(categoria.nome);
  const [novaSub, setNovaSub] = useState("");

  function salvarNome() {
    setEditando(false);
    if (nome.trim() && nome.trim() !== categoria.nome) onRenameCategoria(nome.trim());
  }

  function adicionarSub() {
    if (!novaSub.trim()) return;
    onAddSubcategoria(novaSub.trim());
    setNovaSub("");
  }

  return (
    <div className="mb-2.5 border border-hairline">
      <div className="flex items-center justify-between gap-2 bg-bg-alt px-3.5 py-2.5">
        {editando ? (
          <input
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={salvarNome}
            onKeyDown={(e) => {
              if (e.key === "Enter") salvarNome();
              if (e.key === "Escape") {
                setNome(categoria.nome);
                setEditando(false);
              }
            }}
            className="flex-1 border-b border-gold bg-transparent text-[13px] text-ink outline-none"
          />
        ) : (
          <span className="text-[13px] text-ink">{categoria.nome}</span>
        )}
        <div className="flex shrink-0 gap-3 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-gold transition-colors duration-150 hover:underline"
          >
            editar
          </button>
          <button
            type="button"
            onClick={onDeleteCategoria}
            className="text-error transition-colors duration-150 hover:underline"
          >
            excluir
          </button>
        </div>
      </div>
      <div className="px-3.5 py-3">
        <div className="flex flex-wrap gap-1.5">
          {categoria.subcategorias.map((sub) => (
            <span
              key={sub.id}
              className="flex items-center gap-1.5 border border-hairline-strong px-2 py-1 text-[11px] text-ink-dim"
            >
              {sub.nome}
              <button
                type="button"
                onClick={() => onDeleteSubcategoria(sub.id)}
                className="text-error transition-colors duration-150 hover:text-error"
                aria-label={`Excluir subcategoria ${sub.nome}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5">
          <input
            value={novaSub}
            onChange={(e) => setNovaSub(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") adicionarSub();
            }}
            placeholder="Nova subcategoria…"
            className="flex-1 border border-hairline-strong bg-bg px-2 py-1.5 text-[11px] text-ink outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={adicionarSub}
            disabled={!novaSub.trim()}
            className="border border-hairline-strong px-2.5 py-1.5 text-[11px] text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold disabled:opacity-50"
          >
            + add
          </button>
        </div>
      </div>
    </div>
  );
}

export function CategoriasDespesaEditor({
  categorias,
  onChange,
}: {
  categorias: DespesaCategoria[];
  onChange: (categorias: DespesaCategoria[]) => void;
}) {
  const [novaCategoria, setNovaCategoria] = useState("");
  const [criando, setCriando] = useState(false);

  async function handleAddCategoria() {
    const nome = novaCategoria.trim();
    if (!nome || criando) return;
    setCriando(true);
    try {
      const res = await fetch("/api/admin/despesa-categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      const json = await res.json();
      if (res.ok && json.categoria) {
        onChange([...categorias, json.categoria]);
        setNovaCategoria("");
      }
    } finally {
      setCriando(false);
    }
  }

  async function handleRenameCategoria(categoriaId: string, nome: string) {
    onChange(categorias.map((c) => (c.id === categoriaId ? { ...c, nome } : c)));
    await fetch(`/api/admin/despesa-categorias/${categoriaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
  }

  async function handleDeleteCategoria(categoriaId: string) {
    const categoria = categorias.find((c) => c.id === categoriaId);
    if (!categoria) return;
    if (
      !confirm(
        `Excluir "${categoria.nome}"? As ${categoria.subcategorias.length} subcategoria(s) dela também serão excluídas.`,
      )
    )
      return;
    onChange(categorias.filter((c) => c.id !== categoriaId));
    await fetch(`/api/admin/despesa-categorias/${categoriaId}`, { method: "DELETE" });
  }

  async function handleAddSubcategoria(categoriaId: string, nome: string) {
    const res = await fetch(`/api/admin/despesa-categorias/${categoriaId}/subcategorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    const json = await res.json();
    if (res.ok && json.subcategoria) {
      onChange(
        categorias.map((c) =>
          c.id === categoriaId ? { ...c, subcategorias: [...c.subcategorias, json.subcategoria] } : c,
        ),
      );
    }
  }

  async function handleDeleteSubcategoria(categoriaId: string, subId: string) {
    onChange(
      categorias.map((c) =>
        c.id === categoriaId
          ? { ...c, subcategorias: c.subcategorias.filter((s) => s.id !== subId) }
          : c,
      ),
    );
    await fetch(`/api/admin/despesa-categorias/${categoriaId}/subcategorias/${subId}`, {
      method: "DELETE",
    });
  }

  return (
    <div>
      {categorias.map((categoria) => (
        <CategoriaBloco
          key={categoria.id}
          categoria={categoria}
          onRenameCategoria={(nome) => handleRenameCategoria(categoria.id, nome)}
          onDeleteCategoria={() => handleDeleteCategoria(categoria.id)}
          onAddSubcategoria={(nome) => handleAddSubcategoria(categoria.id, nome)}
          onDeleteSubcategoria={(subId) => handleDeleteSubcategoria(categoria.id, subId)}
        />
      ))}

      <p className="mb-1.5 mt-4 font-eyebrow text-[10px] text-ink-dim">Nova categoria</p>
      <div className="flex gap-1.5">
        <input
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddCategoria();
          }}
          placeholder="Ex.: Seguros"
          className="flex-1 border border-hairline-strong bg-bg px-3 py-2 text-xs text-ink outline-none focus:border-gold"
        />
        <button
          type="button"
          onClick={handleAddCategoria}
          disabled={!novaCategoria.trim() || criando}
          className="border border-gold bg-gold px-3.5 py-2 text-xs text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
        >
          + criar
        </button>
      </div>

      <p className="mt-4 text-[11px] text-ink-dim">
        Excluir uma categoria também remove as subcategorias dela. Despesas já lançadas com essa
        categoria continuam com o texto salvo.
      </p>
    </div>
  );
}

export function CategoriasDespesaModal({
  categorias,
  onChange,
  onClose,
}: {
  categorias: DespesaCategoria[];
  onChange: (categorias: DespesaCategoria[]) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col border border-hairline bg-surface"
        role="dialog"
        aria-modal="true"
        aria-label="Categorias de despesa"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="text-[15px] italic text-ink">Categorias de despesa</p>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-dim transition-colors duration-150 hover:text-gold"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <CategoriasDespesaEditor categorias={categorias} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

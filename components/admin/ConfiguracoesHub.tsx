"use client";

import { useState } from "react";
import Link from "next/link";
import { Workflow, Link2 } from "lucide-react";
import { CategoriasDespesaEditor } from "@/components/admin/CategoriasDespesaModal";
import type { DespesaCategoria } from "@/lib/db-despesa-categorias";

export function ConfiguracoesHub({
  initialCategorias,
}: {
  initialCategorias: DespesaCategoria[];
}) {
  const [categorias, setCategorias] = useState(initialCategorias);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">Configurações</h1>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/admin/fluxos"
          className="flex items-center gap-3 border border-hairline-strong bg-surface px-4 py-4 transition-colors duration-150 hover:border-gold"
        >
          <Workflow size={18} className="text-ink-dim" />
          <div>
            <p className="text-sm text-ink">Modelos de fluxo</p>
            <p className="mt-0.5 font-mono text-[10px] text-ink-dim">
              ir para /admin/fluxos ↗
            </p>
          </div>
        </Link>
        <Link
          href="/admin/links"
          className="flex items-center gap-3 border border-hairline-strong bg-surface px-4 py-4 transition-colors duration-150 hover:border-gold"
        >
          <Link2 size={18} className="text-ink-dim" />
          <div>
            <p className="text-sm text-ink">Hub de Links</p>
            <p className="mt-0.5 font-mono text-[10px] text-ink-dim">
              ir para /admin/links ↗
            </p>
          </div>
        </Link>
      </div>

      <details className="mt-6 border border-hairline-strong bg-surface" open>
        <summary className="cursor-pointer list-none px-4 py-3 text-sm text-ink marker:content-none [&::-webkit-details-marker]:hidden">
          Categorias de despesa
        </summary>
        <div className="border-t border-hairline p-4">
          <CategoriasDespesaEditor categorias={categorias} onChange={setCategorias} />
        </div>
      </details>

      <div className="mt-6 border-l-2 border-hairline-strong pl-4">
        <p className="text-xs leading-relaxed text-ink-dim">
          Categorias do blog e as 5 faixas do Painel de Metas são fixas no
          código — mudar exige um pedido de alteração, não dá pra editar por
          aqui.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Parceiro } from "@/lib/db-parceiros";
import { TIPO_PESSOA_LABELS } from "@/lib/admin-labels";

export interface ParceiroRow extends Parceiro {
  enviadas: number;
  recebidas: number;
}

export function ParceirosAdminList({
  initialParceiros,
}: {
  initialParceiros: ParceiroRow[];
}) {
  const [parceiros] = useState(initialParceiros);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return parceiros;
    return parceiros.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        (p.contato ?? "").toLowerCase().includes(term),
    );
  }, [parceiros, search]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Parcerias</h1>
          <p className="font-mono text-xs text-ink-dim">
            {parceiros.length} parceiros cadastrados
          </p>
        </div>
        <Link
          href="/admin/parcerias/novo"
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          Novo parceiro
        </Link>
      </div>

      <div className="mt-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou contato"
          className="w-full max-w-sm border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
        />
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Enviadas</th>
              <th className="px-4 py-3">Recebidas</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((parceiro) => (
              <tr key={parceiro.id} className="border-b border-hairline">
                <td className="px-4 py-3 text-ink">
                  <Link
                    href={`/admin/parcerias/${parceiro.id}`}
                    className="transition-colors duration-150 hover:text-gold"
                  >
                    {parceiro.nome}
                  </Link>
                  {parceiro.contato && (
                    <p className="mt-0.5 text-xs text-ink-dim">{parceiro.contato}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-dim">
                  {TIPO_PESSOA_LABELS[parceiro.tipo_pessoa]}
                </td>
                <td className="px-4 py-3">
                  <span className="border border-wine px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-wine">
                    {parceiro.enviadas}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="border border-success px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-success">
                    {parceiro.recebidas}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-dim">
                  Nenhum parceiro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

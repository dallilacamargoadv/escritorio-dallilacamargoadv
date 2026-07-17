"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Cliente } from "@/lib/db-clientes";
import type { LeadFormType } from "@/lib/db-leads";
import { TIPO_PESSOA_LABELS, FORM_TYPE_LABELS } from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";
import { AreaFilterPills } from "@/components/admin/AreaFilterPills";

export interface ClienteRow extends Cliente {
  areas: LeadFormType[];
}

export function ClientesAdminList({
  initialClientes,
}: {
  initialClientes: ClienteRow[];
}) {
  const [clientes] = useState(initialClientes);
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clientes.filter((cliente) => {
      if (areaFilter !== "all" && !cliente.areas.includes(areaFilter as LeadFormType)) {
        return false;
      }
      if (!term) return true;
      return (
        cliente.nome_razao_social.toLowerCase().includes(term) ||
        cliente.email.toLowerCase().includes(term) ||
        (cliente.documento ?? "").toLowerCase().includes(term)
      );
    });
  }, [clientes, search, areaFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Clientes</h1>
          <p className="font-mono text-xs text-ink-dim">
            {clientes.length} clientes no total
          </p>
        </div>
        <Link
          href="/admin/clientes/novo"
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          Novo cliente
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        <AreaFilterPills value={areaFilter} onChange={setAreaFilter} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou documento"
          className="w-full max-w-sm border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
        />
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
              <th className="px-4 py-3">Nome / Razão social</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Áreas atendidas</th>
              <th className="px-4 py-3">Cliente desde</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cliente) => (
              <tr key={cliente.id} className="border-b border-hairline">
                <td className="px-4 py-3 text-ink">
                  <Link
                    href={`/admin/clientes/${cliente.id}`}
                    className="transition-colors duration-150 hover:text-gold"
                  >
                    {cliente.nome_razao_social}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-dim">
                  {TIPO_PESSOA_LABELS[cliente.tipo_pessoa]}
                </td>
                <td className="px-4 py-3 text-ink-dim">
                  {cliente.documento || "—"}
                </td>
                <td className="px-4 py-3 text-ink-dim">{cliente.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {cliente.areas.length === 0 && (
                      <span className="text-ink-dim">—</span>
                    )}
                    {cliente.areas.map((area) => (
                      <span
                        key={area}
                        className="border border-hairline-strong px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-ink-dim"
                      >
                        {FORM_TYPE_LABELS[area] ?? area}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                  {formatDate(cliente.created_at)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-dim">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

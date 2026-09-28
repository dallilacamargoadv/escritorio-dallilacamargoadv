"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Lead } from "@/lib/db-admin";
import type { ConteudoEditorial } from "@/lib/db-conteudo-editorial";
import { computeMarketingResumo } from "@/lib/marketing-metrics";
import { CANAL_LABELS, FORMATO_LABELS, PILAR_COLORS, PILAR_LABELS, ORIGEM_LABELS } from "@/lib/admin-labels";
import type { LeadOrigem } from "@/lib/db-admin";

function formatPct(valor: number | null) {
  if (valor === null) return "—";
  return `${Math.round(valor * 100)}%`;
}

export function MarketingOverviewClient({
  leads,
  conteudos,
}: {
  leads: Lead[];
  conteudos: ConteudoEditorial[];
}) {
  const resumo = useMemo(() => computeMarketingResumo(leads, conteudos), [leads, conteudos]);
  const canalTop = resumo.leadsPorOrigem[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <p className="font-eyebrow text-[10px] text-ink-dim">Marketing</p>
        <h1 className="mt-3 text-lg italic text-ink">Painel de Marketing</h1>
        <p className="mt-2 text-sm text-ink-dim">
          Cruza os leads (já com origem registrada no CRM) com o conteúdo lançado no
          <Link href="/admin/marketing/calendario" className="mx-1 text-gold underline underline-offset-2">
            Calendário Editorial
          </Link>
          — o que trouxe atenção, o que gerou lead, o que vale repetir.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4">
        <div className="bg-surface p-4">
          <p className="font-eyebrow text-[10px] text-ink-dim">Leads (total)</p>
          <p className="mt-2 font-display text-2xl italic text-ink tabular-nums">{resumo.totalLeads}</p>
        </div>
        <div className="bg-surface p-4">
          <p className="font-eyebrow text-[10px] text-ink-dim">Canal top</p>
          <p className="mt-2 text-base text-ink">
            {canalTop ? ORIGEM_LABELS[canalTop.origem as LeadOrigem] ?? canalTop.origem : "—"}
          </p>
          {canalTop && (
            <p className="mt-1 text-xs text-ink-dim">
              {canalTop.total} de {resumo.totalLeads} leads
            </p>
          )}
        </div>
        <div className="bg-surface p-4">
          <p className="font-eyebrow text-[10px] text-ink-dim">Lead → Cliente</p>
          <p className="mt-2 font-display text-2xl italic text-ink tabular-nums">
            {formatPct(resumo.conversaoLeadCliente)}
          </p>
        </div>
        <div className="bg-surface p-4">
          <p className="font-eyebrow text-[10px] text-ink-dim">Custo por lead</p>
          <p className="mt-2 text-sm text-ink-dim">sem tráfego pago</p>
        </div>
      </div>

      <div className="mt-8 border border-hairline p-6">
        <p className="font-eyebrow text-[10px] text-ink-dim">Leads por canal</p>
        <div className="mt-4 space-y-2">
          {resumo.leadsPorOrigem.length === 0 && (
            <p className="text-sm text-ink-dim">Nenhum lead registrado ainda.</p>
          )}
          {resumo.leadsPorOrigem.map(({ origem, total }) => {
            const pct = resumo.totalLeads > 0 ? (total / resumo.totalLeads) * 100 : 0;
            return (
              <div key={origem} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-ink-dim">
                  {ORIGEM_LABELS[origem as LeadOrigem] ?? origem}
                </span>
                <div className="h-2 flex-1 bg-bg-alt">
                  <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-xs text-ink-dim tabular-nums">
                  {total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border border-hairline p-6">
        <h3 className="text-sm italic text-ink">O que trouxe atenção</h3>
        <p className="mt-1 text-xs text-ink-dim">
          Conteúdos com alcance/interações lançados no calendário. Preencha esses números lá
          pra este ranking aparecer.
        </p>
        {resumo.trouxeAtencao.length === 0 ? (
          <p className="mt-4 text-sm text-ink-dim">
            Nenhum conteúdo com métrica lançada ainda —{" "}
            <Link href="/admin/marketing/calendario" className="text-gold underline underline-offset-2">
              lance alcance/interações no calendário
            </Link>
            .
          </p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left font-eyebrow text-[10px] text-ink-dim">
                <th className="pb-2 font-normal">Conteúdo</th>
                <th className="pb-2 font-normal">Canal</th>
                <th className="pb-2 font-normal">Pilar</th>
                <th className="pb-2 text-right font-normal">Alcance</th>
                <th className="pb-2 text-right font-normal">Interações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {resumo.trouxeAtencao.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 pr-3 text-ink">{c.tema}</td>
                  <td className="py-2 pr-3 text-xs text-ink-dim">
                    {CANAL_LABELS[c.canal]} · {FORMATO_LABELS[c.formato]}
                  </td>
                  <td className="py-2 pr-3">
                    <span className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase ${PILAR_COLORS[c.pilar]}`}>
                      {PILAR_LABELS[c.pilar]}
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums text-ink-dim">{c.alcance}</td>
                  <td className="py-2 text-right tabular-nums text-ink-dim">{c.interacoes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 border border-hairline p-6">
        <h3 className="text-sm italic text-ink">O que gerou lead</h3>
        <p className="mt-1 text-xs text-ink-dim">
          Cruzamento pelo <code className="font-mono">utm_content</code> do link usado no
          conteúdo com o UTM salvo em cada lead.
        </p>
        {resumo.geraramLead.length === 0 ? (
          <p className="mt-4 text-sm text-ink-dim">
            Nenhum lead casado com um conteúdo específico ainda. Pra isso funcionar, use o link
            da bio/CTA com <code className="font-mono">?utm_content=</code> igual ao código do
            conteúdo (por ex. <code className="font-mono">out-07</code>).
          </p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left font-eyebrow text-[10px] text-ink-dim">
                <th className="pb-2 font-normal">Conteúdo</th>
                <th className="pb-2 font-normal">Canal</th>
                <th className="pb-2 text-right font-normal">Leads gerados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {resumo.geraramLead.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 pr-3 text-ink">{c.tema}</td>
                  <td className="py-2 pr-3 text-xs text-ink-dim">{CANAL_LABELS[c.canal]}</td>
                  <td className="py-2 text-right tabular-nums text-ink">{c.leadsGerados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 border border-hairline p-6">
        <h3 className="text-sm italic text-ink">Vale repetir</h3>
        <p className="mt-1 text-xs text-ink-dim">
          Cruza alcance + geração de lead num placar simples (0–10). Só aparece pra conteúdo
          com as duas métricas preenchidas.
        </p>
        {resumo.valeRepetir.length === 0 ? (
          <p className="mt-4 text-sm text-ink-dim">
            Ainda sem dados suficientes — volte aqui depois de lançar métricas por algumas
            semanas.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {resumo.valeRepetir.map((c) => (
              <div key={c.id} className="border border-hairline p-4">
                <p className="font-display text-lg italic text-ink tabular-nums">
                  {c.score.toFixed(1)}
                  <span className="ml-1 font-mono text-[10px] text-ink-dim">/ 10</span>
                </p>
                <p className="mt-1 text-xs text-ink-dim">{c.tema}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

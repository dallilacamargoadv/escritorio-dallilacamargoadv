"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventoConcurso } from "@/lib/db-estudos";
import { diasEntre, formatarData } from "@/lib/estudos-utils";
import { Sparkle } from "@/components/estudos/Sparkle";
import { BOTAO_SECUNDARIO, CAMPO } from "@/components/estudos/ui";

const SITUACAO: Record<EventoConcurso["situacao"], { t: string; cls: string }> = {
  sem_data: { t: "Sem data", cls: "bg-e-card-2 text-e-dim" },
  previsto: { t: "Previsão", cls: "bg-e-warn-soft text-e-warn" },
  confirmado: { t: "Confirmado", cls: "bg-e-ok-soft text-e-ok" },
  realizado: { t: "Realizado", cls: "bg-e-accent-soft text-e-ink" },
};

export function ConcursoClient({ eventos, hoje }: { eventos: EventoConcurso[]; hoje: string }) {
  const router = useRouter();
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState({ data: "", situacao: "sem_data" as EventoConcurso["situacao"], fonte_url: "", nota: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function abrir(e: EventoConcurso) {
    setEditando(e.id);
    setErro(null);
    setForm({ data: e.data ?? "", situacao: e.situacao, fonte_url: e.fonte_url ?? "", nota: e.nota ?? "" });
  }

  async function salvar(id: string) {
    if (form.data && form.situacao === "sem_data") {
      setErro("Com data informada, escolha se é previsão, confirmada ou realizada.");
      return;
    }
    if ((form.situacao === "confirmado" || form.situacao === "realizado") && !form.fonte_url.trim()) {
      setErro("Para marcar como confirmada, cole o link da fonte oficial.");
      return;
    }
    setSalvando(true);
    const res = await fetch(`/api/admin/estudos/eventos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, data: form.data || null, situacao: form.data ? form.situacao : "sem_data" }),
    });
    setSalvando(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErro(j.error ?? "Não consegui salvar agora.");
      return;
    }
    setEditando(null);
    router.refresh();
  }

  const proximo = eventos.find((e) => e.data && e.data >= hoje && e.situacao !== "realizado");

  return (
    <div className="space-y-5">
      {proximo && (
        <div className="flex items-center gap-4 rounded-2xl border border-e-accent/60 bg-e-accent-soft p-5">
          <Sparkle size={34} variante="brilhante" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">Próxima fase</p>
            <p className="text-lg font-medium text-e-ink">
              {proximo.titulo}: <span className="tabular-nums">{diasEntre(hoje, proximo.data!)}</span> dias
            </p>
            <p className="text-xs text-e-dim">
              {formatarData(proximo.data!, { day: "2-digit", month: "long", year: "numeric" })} · {SITUACAO[proximo.situacao].t}
            </p>
          </div>
        </div>
      )}

      <ol className="relative space-y-3 border-l border-e-line pl-5">
        {eventos.map((e) => (
          <li key={e.id} className="relative">
            <span className={`absolute -left-[27px] top-4 h-3 w-3 rounded-full border-2 border-e-bg ${e.situacao === "realizado" ? "bg-e-ok" : e.data ? "bg-e-accent" : "bg-e-line"}`} />
            <div className="rounded-2xl border border-e-line bg-e-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-e-ink">{e.titulo}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${SITUACAO[e.situacao].cls}`}>{SITUACAO[e.situacao].t}</span>
              </div>
              <p className="mt-1 text-xs text-e-dim">
                {e.data ? formatarData(e.data, { day: "2-digit", month: "2-digit", year: "numeric" }) : "Data ainda não divulgada"}
                {e.data && e.data >= hoje ? ` · faltam ${diasEntre(hoje, e.data)} dias` : ""}
              </p>
              {e.nota && <p className="mt-1 text-xs text-e-dim">{e.nota}</p>}
              {e.fonte_url && (
                <a href={e.fonte_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-e-blue underline">
                  Fonte
                </a>
              )}
              {editando === e.id ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-[11px] text-e-dim">
                    Data
                    <input type="date" value={form.data} onChange={(ev) => setForm({ ...form, data: ev.target.value })} className={CAMPO} />
                  </label>
                  <label className="text-[11px] text-e-dim">
                    Situação
                    <select value={form.situacao} onChange={(ev) => setForm({ ...form, situacao: ev.target.value as EventoConcurso["situacao"] })} className={CAMPO}>
                      {Object.entries(SITUACAO).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.t}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[11px] text-e-dim sm:col-span-2">
                    Link da fonte oficial
                    <input type="url" value={form.fonte_url} onChange={(ev) => setForm({ ...form, fonte_url: ev.target.value })} placeholder="https://www.ma.gov.br/..." className={CAMPO} />
                  </label>
                  <label className="text-[11px] text-e-dim sm:col-span-2">
                    Observação
                    <input value={form.nota} onChange={(ev) => setForm({ ...form, nota: ev.target.value })} className={CAMPO} />
                  </label>
                  {erro && <p role="alert" className="text-sm text-e-bad sm:col-span-2">{erro}</p>}
                  <div className="flex gap-2 sm:col-span-2">
                    <button type="button" disabled={salvando} onClick={() => salvar(e.id)} className="rounded-full bg-e-glow px-4 py-1.5 text-sm font-medium text-e-bg disabled:opacity-60">
                      {salvando ? "Salvando" : "Salvar"}
                    </button>
                    <button type="button" onClick={() => setEditando(null)} className={BOTAO_SECUNDARIO}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => abrir(e)} className={`${BOTAO_SECUNDARIO} mt-3`}>
                  Atualizar
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

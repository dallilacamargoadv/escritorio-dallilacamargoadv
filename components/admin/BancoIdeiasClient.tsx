"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import {
  IDEIA_AREA_LABELS,
  IDEIA_FORMATO_LABELS,
  IDEIA_STATUS_LABELS,
  type Ideia,
  type IdeiaFormato,
  type IdeiaStatus,
} from "@/lib/ideias-labels";

const STATUS_ORDEM = Object.keys(IDEIA_STATUS_LABELS) as IdeiaStatus[];
const FORMATOS = Object.keys(IDEIA_FORMATO_LABELS) as IdeiaFormato[];
const INPUT =
  "mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold";

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export function BancoIdeiasClient({ ideiasIniciais }: { ideiasIniciais: Ideia[] }) {
  const [ideias, setIdeias] = useState<Ideia[]>(ideiasIniciais);
  const [filtro, setFiltro] = useState<"todas" | IdeiaFormato>("todas");
  const [formAberto, setFormAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [formato, setFormato] = useState<IdeiaFormato>("video");
  const [area, setArea] = useState("");
  const [gancho, setGancho] = useState("");
  const [notas, setNotas] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [calendarioId, setCalendarioId] = useState<string | null>(null);
  const [dataCal, setDataCal] = useState(hojeISO());
  const [pilarCal, setPilarCal] = useState("topo");

  const visiveis = useMemo(
    () => (filtro === "todas" ? ideias : ideias.filter((i) => i.formato === filtro)),
    [ideias, filtro],
  );

  function substituir(nova: Ideia) {
    setIdeias((atual) => atual.map((i) => (i.id === nova.id ? nova : i)));
  }

  async function criar() {
    if (!titulo.trim()) {
      setErro("Escreva o título da ideia.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const res = await fetch("/api/admin/ideias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, formato, area, gancho, notas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setIdeias((atual) => [data.ideia as Ideia, ...atual]);
      setTitulo("");
      setGancho("");
      setNotas("");
      setArea("");
      setFormAberto(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  async function mudarStatus(ideia: Ideia, status: IdeiaStatus) {
    const res = await fetch(`/api/admin/ideias/${ideia.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) substituir((await res.json()).ideia as Ideia);
  }

  async function excluir(ideia: Ideia) {
    if (!window.confirm("Excluir esta ideia?")) return;
    const res = await fetch(`/api/admin/ideias/${ideia.id}`, { method: "DELETE" });
    if (res.ok) setIdeias((atual) => atual.filter((i) => i.id !== ideia.id));
  }

  async function enviarAoCalendario(ideia: Ideia) {
    const res = await fetch(`/api/admin/ideias/${ideia.id}/calendario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataCal, pilar: pilarCal }),
    });
    if (res.ok) {
      substituir((await res.json()).ideia as Ideia);
      setCalendarioId(null);
    } else {
      setErro("Não foi possível enviar ao calendário.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <p className="font-eyebrow text-[10px] text-ink-dim">Marketing</p>
        <h1 className="mt-3 text-lg italic text-ink">Banco de ideias</h1>
        <p className="mt-2 text-sm text-ink-dim">
          Guarde ideias de vídeo, carrossel, post e artigo. Quando estiver pronta, envie ao
          Calendário Editorial.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["todas", ...FORMATOS] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
              filtro === f
                ? "border-gold bg-gold text-bg"
                : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
            }`}
          >
            {f === "todas" ? "Todas" : IDEIA_FORMATO_LABELS[f]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setFormAberto((v) => !v)}
          className="ml-auto flex items-center gap-1 border border-gold px-3 py-1.5 text-xs text-gold transition-colors duration-150 hover:bg-gold hover:text-bg"
        >
          <Plus size={14} /> Nova ideia
        </button>
      </div>

      {formAberto && (
        <div className="mt-4 border border-hairline-strong p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label className="font-eyebrow text-[10px] text-ink-dim">Título</label>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Formato</label>
              <select value={formato} onChange={(e) => setFormato(e.target.value as IdeiaFormato)} className={INPUT}>
                {FORMATOS.map((f) => (
                  <option key={f} value={f}>{IDEIA_FORMATO_LABELS[f]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Área</label>
              <select value={area} onChange={(e) => setArea(e.target.value)} className={INPUT}>
                <option value="">Sem área</option>
                {Object.entries(IDEIA_AREA_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="font-eyebrow text-[10px] text-ink-dim">Gancho (primeira frase)</label>
              <input value={gancho} onChange={(e) => setGancho(e.target.value)} className={INPUT} />
            </div>
            <div className="sm:col-span-3">
              <label className="font-eyebrow text-[10px] text-ink-dim">Notas</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className={INPUT} />
            </div>
          </div>
          {erro && <p role="alert" className="mt-3 text-sm text-wine">{erro}</p>}
          <button
            type="button"
            onClick={criar}
            disabled={salvando}
            className="mt-4 bg-gold px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
          >
            {salvando ? "Salvando…" : "Salvar ideia"}
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATUS_ORDEM.map((status) => {
          const coluna = visiveis.filter((i) => i.status === status);
          return (
            <section key={status}>
              <h2 className="font-eyebrow text-[10px] text-ink-dim">
                {IDEIA_STATUS_LABELS[status]} ({coluna.length})
              </h2>
              <div className="mt-2 space-y-2">
                {coluna.length === 0 && (
                  <p className="border border-dashed border-hairline p-3 text-xs text-ink-dim">Nada aqui.</p>
                )}
                {coluna.map((ideia) => (
                  <article key={ideia.id} className="border border-hairline-strong p-3">
                    <p className="text-sm text-ink">{ideia.titulo}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="bg-wine/30 px-2 py-0.5 text-ink">{IDEIA_FORMATO_LABELS[ideia.formato]}</span>
                      {ideia.area && (
                        <span className="border border-hairline-strong px-2 py-0.5 text-ink-dim">
                          {IDEIA_AREA_LABELS[ideia.area] ?? ideia.area}
                        </span>
                      )}
                    </div>
                    {ideia.gancho && <p className="mt-2 text-xs text-ink-dim">Gancho: {ideia.gancho}</p>}
                    {ideia.notas && <p className="mt-1 whitespace-pre-line text-xs text-ink-dim">{ideia.notas}</p>}

                    <select
                      value={ideia.status}
                      onChange={(e) => mudarStatus(ideia, e.target.value as IdeiaStatus)}
                      aria-label="Mudar de coluna"
                      className="mt-3 w-full border border-hairline-strong bg-bg px-2 py-1.5 text-xs text-ink"
                    >
                      {STATUS_ORDEM.map((s) => (
                        <option key={s} value={s}>{IDEIA_STATUS_LABELS[s]}</option>
                      ))}
                    </select>

                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      {ideia.conteudo_editorial_id ? (
                        <Link href="/admin/marketing/calendario" className="text-gold underline-offset-4 hover:underline">
                          Está no calendário
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCalendarioId(calendarioId === ideia.id ? null : ideia.id)}
                          className="text-gold underline-offset-4 hover:underline"
                        >
                          Enviar ao calendário
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => excluir(ideia)}
                        aria-label="Excluir ideia"
                        className="text-ink-dim hover:text-wine"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {calendarioId === ideia.id && (
                      <div className="mt-3 space-y-2 border-t border-hairline pt-3">
                        <input
                          type="date"
                          value={dataCal}
                          onChange={(e) => setDataCal(e.target.value)}
                          className="w-full border border-hairline-strong bg-bg px-2 py-1.5 text-xs text-ink"
                        />
                        <select
                          value={pilarCal}
                          onChange={(e) => setPilarCal(e.target.value)}
                          className="w-full border border-hairline-strong bg-bg px-2 py-1.5 text-xs text-ink"
                        >
                          <option value="topo">Topo de funil</option>
                          <option value="meio">Meio de funil</option>
                          <option value="fundo">Fundo de funil</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => enviarAoCalendario(ideia)}
                          className="w-full bg-gold px-2 py-1.5 text-xs font-medium text-bg"
                        >
                          Confirmar
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

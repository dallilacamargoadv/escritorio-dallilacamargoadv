"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  STORY_TELA_LABELS,
  type StoriesPlano,
  type StoryTela,
  type StoryTelaTipo,
} from "@/lib/ideias-labels";

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const TIPOS = Object.keys(STORY_TELA_LABELS) as StoryTelaTipo[];
const INPUT =
  "w-full border border-hairline-strong bg-bg px-2 py-1.5 text-xs text-ink outline-none focus:border-gold";

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function somarDias(iso: string, dias: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + dias);
  return toISO(d);
}

function rotuloData(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function DiaCard({
  data,
  diaSemana,
  plano,
}: {
  data: string;
  diaSemana: string;
  plano: StoriesPlano | undefined;
}) {
  const [tema, setTema] = useState(plano?.tema ?? "");
  const [telas, setTelas] = useState<StoryTela[]>(plano?.telas ?? []);
  const [salvo, setSalvo] = useState(Boolean(plano));
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);

  function mudar<T>(fn: () => T): T {
    setSalvo(false);
    setMsg("");
    return fn();
  }

  async function salvar() {
    setOcupado(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/stories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, tema, telas }),
      });
      if (!res.ok) throw new Error();
      setSalvo(true);
      setMsg("Salvo e no calendário.");
    } catch {
      setMsg("Não foi possível salvar.");
    } finally {
      setOcupado(false);
    }
  }

  async function excluir() {
    if (!window.confirm("Excluir o plano deste dia?")) return;
    setOcupado(true);
    try {
      const res = await fetch(`/api/admin/stories?data=${data}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTema("");
      setTelas([]);
      setSalvo(false);
      setMsg("Plano excluído.");
    } catch {
      setMsg("Não foi possível excluir.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="border border-hairline-strong p-3">
      <p className="font-eyebrow text-[10px] text-gold">
        {diaSemana} · {rotuloData(data)}
      </p>
      <input
        value={tema}
        onChange={(e) => mudar(() => setTema(e.target.value))}
        placeholder="Tema do dia"
        aria-label={`Tema de ${diaSemana}`}
        className={`${INPUT} mt-2`}
      />

      <ol className="mt-3 space-y-2">
        {telas.map((tela, i) => (
          <li key={i} className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="w-4 text-[11px] text-ink-dim">{i + 1}</span>
              <select
                value={tela.tipo}
                onChange={(e) =>
                  mudar(() =>
                    setTelas((atual) =>
                      atual.map((t, j) => (j === i ? { ...t, tipo: e.target.value as StoryTelaTipo } : t)),
                    ),
                  )
                }
                aria-label={`Tipo da tela ${i + 1}`}
                className={INPUT}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{STORY_TELA_LABELS[t]}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => mudar(() => setTelas((atual) => atual.filter((_, j) => j !== i)))}
                aria-label={`Remover tela ${i + 1}`}
                className="text-ink-dim hover:text-wine"
              >
                <X size={14} />
              </button>
            </div>
            <input
              value={tela.texto}
              onChange={(e) =>
                mudar(() =>
                  setTelas((atual) => atual.map((t, j) => (j === i ? { ...t, texto: e.target.value } : t))),
                )
              }
              placeholder="O que aparece nessa tela"
              aria-label={`Texto da tela ${i + 1}`}
              className={INPUT}
            />
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => mudar(() => setTelas((atual) => [...atual, { tipo: "texto", texto: "" }]))}
        className="mt-3 flex items-center gap-1 text-xs text-gold underline-offset-4 hover:underline"
      >
        <Plus size={12} /> Adicionar tela
      </button>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={salvar}
          disabled={ocupado || (!tema.trim() && telas.length === 0)}
          className="bg-gold px-3 py-1.5 text-xs font-medium text-bg disabled:opacity-50"
        >
          {ocupado ? "Salvando…" : salvo ? "Salvar de novo" : "Salvar"}
        </button>
        {plano && (
          <button
            type="button"
            onClick={excluir}
            disabled={ocupado}
            className="text-xs text-ink-dim hover:text-wine disabled:opacity-50"
          >
            Excluir dia
          </button>
        )}
      </div>
      {msg && <p className="mt-2 text-[11px] text-ink-dim">{msg}</p>}
    </div>
  );
}

export function StoriesPlanejadorClient({
  inicioInicial,
  planosIniciais,
}: {
  inicioInicial: string;
  planosIniciais: StoriesPlano[];
}) {
  const [inicio, setInicio] = useState(inicioInicial);
  const [planos, setPlanos] = useState<StoriesPlano[]>(planosIniciais);
  const [carregando, setCarregando] = useState(false);

  async function irParaSemana(novoInicio: string) {
    setCarregando(true);
    try {
      const res = await fetch(
        `/api/admin/stories?inicio=${novoInicio}&fim=${somarDias(novoInicio, 6)}`,
      );
      const data = await res.json();
      setPlanos((data.planos ?? []) as StoriesPlano[]);
      setInicio(novoInicio);
    } finally {
      setCarregando(false);
    }
  }

  const dias = DIAS_SEMANA.map((nome, i) => ({ nome, data: somarDias(inicio, i) }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <p className="font-eyebrow text-[10px] text-ink-dim">Marketing</p>
        <h1 className="mt-3 text-lg italic text-ink">Stories da semana</h1>
        <p className="mt-2 text-sm text-ink-dim">
          Dê um tema a cada dia e monte a sequência de telas. Cada dia salvo aparece no
          Calendário Editorial.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => irParaSemana(somarDias(inicio, -7))}
          disabled={carregando}
          className="border border-hairline-strong px-3 py-1.5 text-xs text-ink-dim hover:border-gold hover:text-gold disabled:opacity-50"
        >
          ← Semana anterior
        </button>
        <p className="text-sm text-ink">
          {rotuloData(inicio)} a {rotuloData(somarDias(inicio, 6))}
        </p>
        <button
          type="button"
          onClick={() => irParaSemana(somarDias(inicio, 7))}
          disabled={carregando}
          className="border border-hairline-strong px-3 py-1.5 text-xs text-ink-dim hover:border-gold hover:text-gold disabled:opacity-50"
        >
          Próxima semana →
        </button>
      </div>

      <div className={`mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${carregando ? "opacity-50" : ""}`}>
        {dias.map((dia) => (
          <DiaCard
            key={dia.data}
            data={dia.data}
            diaSemana={dia.nome}
            plano={planos.find((p) => p.data === dia.data)}
          />
        ))}
      </div>
    </div>
  );
}

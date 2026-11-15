"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAMPO } from "@/components/estudos/ui";

interface Linha {
  assunto: string;
  questoes: number;
  acertos: number | null;
}

/** Aceita uma linha por assunto: "Assunto ; questões ; acertos", com tab, ponto e vírgula ou barra vertical. Também entende "12 de 17" e "71%". */
export function interpretar(texto: string, comAcertos: boolean): { linhas: Linha[]; erros: string[] } {
  const linhas: Linha[] = [];
  const erros: string[] = [];
  for (const bruta of texto.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const partes = bruta.split(/\t|;|\|/).map((p) => p.trim()).filter(Boolean);
    let assunto = partes[0] ?? "";
    const resto = partes.slice(1).join(" ");
    let questoes: number | null = null;
    let acertos: number | null = null;
    const deMatch = (resto || bruta).match(/(\d+)\s*(?:de|\/)\s*(\d+)/i);
    if (deMatch) {
      acertos = Number(deMatch[1]);
      questoes = Number(deMatch[2]);
      if (!resto) assunto = bruta.slice(0, deMatch.index).trim();
    } else {
      const nums = (resto || bruta).match(/\d+(?:[.,]\d+)?%?/g) ?? [];
      if (!resto && nums[0]) assunto = bruta.slice(0, bruta.indexOf(nums[0])).trim();
      const inteiros = nums.filter((n) => !n.endsWith("%")).map((n) => Number(n.replace(",", ".")));
      const pct = nums.find((n) => n.endsWith("%"));
      questoes = inteiros[0] ?? null;
      if (inteiros.length > 1) acertos = inteiros[1];
      else if (pct && questoes !== null) acertos = Math.round((Number(pct.replace("%", "").replace(",", ".")) / 100) * questoes);
    }
    assunto = assunto.replace(/[-:–]+$/, "").trim();
    if (!assunto || questoes === null || !Number.isInteger(questoes)) {
      erros.push(bruta);
      continue;
    }
    if (comAcertos && (acertos === null || acertos > questoes)) {
      erros.push(bruta);
      continue;
    }
    linhas.push({ assunto, questoes, acertos: comAcertos ? acertos : null });
  }
  return { linhas, erros };
}

export function TecForm({ materias }: { materias: { id: string; nome: string }[] }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"resolucao" | "incidencia">("resolucao");
  const [materia, setMateria] = useState(materias[0]?.id ?? "");
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const previa = interpretar(texto, tipo === "resolucao");

  async function salvar() {
    if (!previa.linhas.length) {
      setMsg({ ok: false, t: "Cole ao menos uma linha no formato do exemplo." });
      return;
    }
    if (previa.erros.length) {
      setMsg({ ok: false, t: `Não entendi ${previa.erros.length} linha(s). Corrija ou apague antes de salvar.` });
      return;
    }
    setSalvando(true);
    const res = await fetch("/api/admin/estudos/tec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, materia_id: materia, linhas: previa.linhas }),
    });
    setSalvando(false);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg({ ok: false, t: j.error ?? "Não consegui salvar." });
      return;
    }
    setMsg({ ok: true, t: `${j.total} linha(s) salvas.` });
    setTexto("");
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-e-line bg-e-card p-4">
      <h2 className="text-sm font-medium text-e-ink">Lançar dados do TEC</h2>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de dado">
        {([
          ["resolucao", "Meus resultados (questões que resolvi)"],
          ["incidencia", "Incidência na FCC (quantas questões existem por assunto)"],
        ] as const).map(([k, t]) => (
          <button key={k} type="button" role="radio" aria-checked={tipo === k} onClick={() => setTipo(k)} className={`rounded-full border px-3 py-1.5 text-xs ${tipo === k ? "border-e-glow bg-e-glow text-e-bg" : "border-e-line text-e-dim hover:text-e-ink"}`}>
            {t}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-e-dim">
        {tipo === "resolucao"
          ? "Uma linha por assunto: assunto ; questões ; acertos. Também aceito “Das pessoas 16 de 18” ou “Crase 20 75%”."
          : "No TEC, filtre banca FCC e a matéria, e copie a quantidade de questões de cada assunto. Uma linha por assunto: assunto ; quantidade. Isso mostra o que a FCC cobra mais e menos."}
      </p>
      <label className="mt-3 block text-[11px] text-e-dim">
        Matéria
        <select value={materia} onChange={(e) => setMateria(e.target.value)} className={CAMPO}>
          {materias.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      </label>
      <label className="mt-3 block text-[11px] text-e-dim">
        Cole aqui
        <textarea
          rows={6}
          value={texto}
          onChange={(e) => { setTexto(e.target.value); setMsg(null); }}
          placeholder={tipo === "resolucao" ? "Teoria da Constituição ; 19 ; 13\nClassificação das Constituições ; 10 ; 6" : "Licitações e contratos ; 1240\nAtos administrativos ; 860"}
          className={`${CAMPO} font-mono text-xs`}
        />
      </label>
      {texto.trim() && (
        <p className="mt-2 text-xs text-e-dim">
          Entendi {previa.linhas.length} linha(s){previa.erros.length ? <span className="text-e-bad">, e não entendi {previa.erros.length}: {previa.erros.slice(0, 2).join(" · ")}</span> : ""}.
        </p>
      )}
      <button type="button" onClick={salvar} disabled={salvando} className="mt-3 rounded-full bg-e-glow px-4 py-2 text-sm font-medium text-e-bg disabled:opacity-60">
        {salvando ? "Salvando" : "Salvar"}
      </button>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-2 text-sm ${msg.ok ? "text-e-ok" : "text-e-bad"}`}>{msg.t}</p>}
    </section>
  );
}

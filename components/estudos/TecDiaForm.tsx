"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO } from "@/components/estudos/ui";

interface RegistroDia {
  id: string;
  referencia: string;
  materia_id: string;
  assunto: string;
  questoes: number;
  acertos: number | null;
}

type LinhaForm = { assunto: string; feitas: string; acertos: string };
const VAZIA: LinhaForm = { assunto: "", feitas: "", acertos: "" };

/** Lançamento do TEC do dia: grava em estudo_tec (tipo resolucao) com a data escolhida. */
export function TecDiaForm({
  hoje,
  materias,
  assuntos,
  registros,
}: {
  hoje: string;
  materias: { id: string; nome: string }[];
  assuntos: Record<string, string[]>;
  registros: RegistroDia[];
}) {
  const router = useRouter();
  const [dia, setDia] = useState(hoje);
  const [materia, setMateria] = useState("");
  const [linhas, setLinhas] = useState<LinhaForm[]>([{ ...VAZIA }]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const nome = new Map(materias.map((m) => [m.id, m.nome]));
  const doDia = registros.filter((r) => r.referencia === dia);

  function mudar(i: number, campo: keyof LinhaForm, valor: string) {
    setErro("");
    setLinhas((ls) => ls.map((l, j) => (j === i ? { ...l, [campo]: valor } : l)));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!materia) return setErro("Escolha a matéria.");
    const preenchidas = linhas.filter((l) => l.assunto.trim() || l.feitas || l.acertos);
    if (!preenchidas.length) return setErro("Preencha ao menos uma linha.");
    for (const l of preenchidas) {
      const q = Number(l.feitas);
      const a = Number(l.acertos);
      if (!l.assunto.trim()) return setErro("Falta o assunto em uma linha.");
      if (!Number.isInteger(q) || q < 1) return setErro(`Feitas inválido em "${l.assunto}".`);
      if (!Number.isInteger(a) || a < 0 || a > q) return setErro(`Acertos precisa ficar entre 0 e ${q} em "${l.assunto}".`);
    }
    setSalvando(true);
    const res = await fetch("/api/admin/estudos/tec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "resolucao",
        materia_id: materia,
        referencia: dia,
        linhas: preenchidas.map((l) => ({ assunto: l.assunto.trim(), questoes: Number(l.feitas), acertos: Number(l.acertos) })),
      }),
    });
    setSalvando(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      return setErro(j?.error ?? "Não foi possível salvar.");
    }
    setLinhas([{ ...VAZIA }]);
    router.refresh();
  }

  async function apagar(id: string) {
    if (!confirm("Apagar este lançamento?")) return;
    const res = await fetch(`/api/admin/estudos/tec/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else setErro("Não foi possível apagar.");
  }

  return (
    <form onSubmit={salvar} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-[11px] text-e-dim">
          Dia
          <input type="date" value={dia} max={hoje} onChange={(e) => setDia(e.target.value)} className={CAMPO} />
        </label>
        <label className="text-[11px] text-e-dim">
          Matéria
          <select value={materia} onChange={(e) => { setMateria(e.target.value); setErro(""); }} className={CAMPO}>
            <option value="">Escolha</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </label>
      </div>
      <datalist id="tec-assuntos">
        {(assuntos[materia] ?? []).map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
      {linhas.map((l, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_56px_56px_24px] items-end gap-2">
          <label className="text-[11px] text-e-dim">
            Assunto
            <input list="tec-assuntos" value={l.assunto} onChange={(e) => mudar(i, "assunto", e.target.value)} className={CAMPO} />
          </label>
          <label className="text-[11px] text-e-dim">
            Feitas
            <input inputMode="numeric" value={l.feitas} onChange={(e) => mudar(i, "feitas", e.target.value.replace(/\D/g, ""))} className={CAMPO} />
          </label>
          <label className="text-[11px] text-e-dim">
            Acertos
            <input inputMode="numeric" value={l.acertos} onChange={(e) => mudar(i, "acertos", e.target.value.replace(/\D/g, ""))} className={CAMPO} />
          </label>
          <button
            type="button"
            aria-label="Tirar esta linha"
            onClick={() => setLinhas((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : [{ ...VAZIA }]))}
            className="mb-1.5 text-e-dim hover:text-e-ink"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      {erro && <p className="text-xs text-e-bad">{erro}</p>}
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setLinhas((ls) => [...ls, { ...VAZIA }])} className={BOTAO_SECUNDARIO}>
          <Plus size={13} /> Outro assunto
        </button>
        <button type="submit" disabled={salvando} className={BOTAO_PRIMARIO}>
          {salvando ? "Salvando..." : "Salvar o dia"}
        </button>
      </div>
      <div className="border-t border-e-line pt-3">
        <p className="text-[11px] text-e-dim">Lançados em {dia.split("-").reverse().join("/")}</p>
        {doDia.length === 0 ? (
          <p className="mt-1 text-xs text-e-dim">Nada lançado neste dia.</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {doDia.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="min-w-0 truncate text-e-ink">
                  {nome.get(r.materia_id) ?? r.materia_id} · {r.assunto}{" "}
                  <span className="tabular-nums text-e-dim">{r.acertos ?? 0}/{r.questoes}</span>
                </span>
                <button type="button" onClick={() => apagar(r.id)} className="shrink-0 text-e-bad hover:underline">
                  apagar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}

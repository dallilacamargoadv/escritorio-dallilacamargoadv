"use client";

import { useEffect, useState } from "react";
import { Eye, Lightbulb } from "lucide-react";
import { estimarLinhas } from "@/lib/estudos-redacao";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, Card, CardTitulo } from "@/components/estudos/ui";

export interface ExercicioTreino {
  id: string;
  mat: string;
  tema: string;
  caso: string;
  q: string;
  dicas: string[];
  lei: [string, string][];
  modelo: string;
  check: string[];
  pega: string;
}

const LIMITE = 8;

// Rascunho e checklist ficam no navegador (treino curto; o caso completo do dia grava no site).
function ler(k: string): string {
  try {
    return localStorage.getItem(k) ?? "";
  } catch {
    return "";
  }
}
function gravar(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {}
}

function Exercicio({ ex, n }: { ex: ExercicioTreino; n: number }) {
  const chave = `treino-disc:${ex.id}`;
  const [texto, setTexto] = useState("");
  const [marcas, setMarcas] = useState<boolean[]>(() => ex.check.map(() => false));
  const [dicas, setDicas] = useState(0);
  const [ver, setVer] = useState(false);

  useEffect(() => {
    // Lê o rascunho só no navegador, depois da hidratação.
    const t = ler(chave);
    const m = ler(`${chave}:check`);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (t) setTexto(t);
    if (m) setMarcas(ex.check.map((_, i) => m[i] === "1"));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [chave, ex.check]);

  const linhas = estimarLinhas(texto);
  const k = marcas.filter(Boolean).length;
  const placar =
    k === ex.check.length ? "Resposta completa." : k >= ex.check.length - 1 ? "Quase lá: reescreva o que faltou." : "Reescreva usando o molde e marque de novo.";

  return (
    <Card>
      <CardTitulo acao={<span className="rounded-full bg-e-card-2 px-2 py-0.5 text-[11px] text-e-dim">{ex.tema}</span>}>
        Quesito {n} · {ex.mat}
      </CardTitulo>
      <p className="font-serif text-[15px] leading-relaxed text-e-ink">{ex.caso}</p>
      <p className="mt-2 text-sm font-medium text-e-ink">{ex.q}</p>
      {dicas > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {ex.dicas.slice(0, dicas).map((d, i) => (
            <li key={d} className="rounded-lg bg-e-accent-soft px-3 py-1.5 text-sm text-e-ink">
              <b>Dica {i + 1}:</b> {d}
            </li>
          ))}
        </ul>
      )}
      <textarea
        id={`${ex.id}-txt`}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          gravar(chave, e.target.value);
        }}
        rows={6}
        className={`mt-3 ${CAMPO} font-serif text-[15px] leading-relaxed`}
        placeholder="Escreva aqui, sem consultar. Comece pela tese: Sim ou Não."
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className={BOTAO_SECUNDARIO} disabled={dicas >= ex.dicas.length} onClick={() => setDicas(dicas + 1)}>
          <Lightbulb size={13} aria-hidden="true" /> Quero uma dica
        </button>
        <button type="button" className={BOTAO_PRIMARIO} onClick={() => setVer(!ver)}>
          <Eye size={13} aria-hidden="true" /> {ver ? "Esconder o espelho" : "Ver o espelho"}
        </button>
        <span className={`ml-auto text-xs ${linhas > LIMITE ? "text-e-warn" : "text-e-dim"}`}>
          ≈ {linhas} de {LIMITE} linhas
        </span>
      </div>
      {ver && (
        <div className="mt-4 flex flex-col gap-3 border-t border-dashed border-e-line pt-4">
          <p className="text-sm font-medium text-e-ink">O que a resposta precisa ter</p>
          <div className="flex flex-col gap-1.5">
            {ex.check.map((c, i) => (
              <label key={c} className="flex cursor-pointer items-start gap-2 text-sm text-e-ink">
                <input
                  type="checkbox"
                  className="mt-1 accent-[var(--e-ok)]"
                  checked={marcas[i]}
                  onChange={(e) => {
                    const m = marcas.map((x, j) => (j === i ? e.target.checked : x));
                    setMarcas(m);
                    gravar(`${chave}:check`, m.map((x) => (x ? "1" : "0")).join(""));
                  }}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
          <p className="text-sm font-medium text-e-ink">
            Você marcou {k} de {ex.check.length}. {placar}
          </p>
          <p className="text-sm font-medium text-e-ink">Lei seca</p>
          {ex.lei.map(([r, t]) => (
            <div key={r} className="rounded-lg bg-e-card-2 px-3 py-2 text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-e-blue">{r}</p>
              <p className="text-e-ink">{t}</p>
            </div>
          ))}
          <p className="text-sm font-medium text-e-ink">Resposta modelo</p>
          <p className="font-serif text-[15px] leading-relaxed text-e-ink">{ex.modelo}</p>
          <p className="border-l-2 border-e-bad pl-3 text-sm text-e-ink">
            <b>Como a FCC tenta te pegar:</b> {ex.pega}
          </p>
        </div>
      )}
    </Card>
  );
}

export function TreinoDiscursivaClient({ exercicios }: { exercicios: ExercicioTreino[] }) {
  return (
    <div className="flex flex-col gap-4">
      {exercicios.map((ex, i) => (
        <Exercicio key={ex.id} ex={ex} n={i + 1} />
      ))}
    </div>
  );
}

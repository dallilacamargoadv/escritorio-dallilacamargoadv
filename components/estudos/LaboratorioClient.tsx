"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Copy, Settings2 } from "lucide-react";
import { CLASSIFICACAO_LABEL } from "@/lib/estudos-desempenho";
import { LAB_CONFIG_PADRAO, NIVEL_COR, type LabConfig, type NoDominio } from "@/lib/estudos-laboratorio";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO } from "@/components/estudos/ui";

function Linha({ no, nivelNome, profundidade }: { no: NoDominio; nivelNome: string[]; profundidade: number }) {
  const [aberto, setAberto] = useState(false);
  const temFilhos = no.filhos.length > 0;
  const cor = NIVEL_COR[no.nivel];
  const e = no.erro;
  return (
    <li>
      <div className="flex items-center gap-3 border-t border-e-line py-2 text-sm" style={{ paddingLeft: profundidade * 20 }}>
        {temFilhos ? (
          <button
            type="button"
            onClick={() => setAberto(!aberto)}
            aria-expanded={aberto}
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-e-ink hover:text-e-glow"
          >
            {aberto ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}
            <span className={`truncate ${profundidade === 0 ? "font-medium" : ""}`}>{no.rotulo}</span>
          </button>
        ) : e ? (
          <Link
            href={`/admin/estudos/questoes?materia=${e.materia_id}&status=erradas&id=${encodeURIComponent(e.questao_id)}`}
            className="min-w-0 flex-1 truncate pl-5 text-e-dim hover:text-e-ink"
            title="Abrir a questão"
          >
            {no.rotulo} · {CLASSIFICACAO_LABEL[e.tipoMaisComum].toLowerCase()} · {e.superado ? "superado" : `errou ${e.falhas}x`}
          </Link>
        ) : (
          <span className="min-w-0 flex-1 truncate pl-5 text-e-ink">{no.rotulo}</span>
        )}
        {!e && (
          <span className="hidden w-24 shrink-0 text-right text-[11px] tabular-nums text-e-dim lg:block">
            {no.respondidas} de {no.total}
          </span>
        )}
        <span className="relative hidden h-2 w-28 shrink-0 overflow-hidden rounded-full bg-e-line lg:block">
          <span className={`absolute inset-y-0 left-0 rounded-full ${cor.barra}`} style={{ width: `${no.pct}%` }} />
        </span>
        <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-center text-[11px] ${cor.pill}`}>
          {no.nivel} {nivelNome[no.nivel]}
        </span>
      </div>
      {aberto && temFilhos && (
        <ul>
          {no.filhos.map((f) => (
            <Linha key={f.id} no={f} nivelNome={nivelNome} profundidade={profundidade + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ArvoreDominio({ arvore, niveis }: { arvore: NoDominio[]; niveis: string[] }) {
  return (
    <ul className="border-b border-e-line">
      {arvore.map((no) => (
        <Linha key={no.id} no={no} nivelNome={niveis} profundidade={0} />
      ))}
    </ul>
  );
}

export function AjustarNiveis({ config }: { config: LabConfig }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [c, setC] = useState(config);
  const [estado, setEstado] = useState<"" | "salvando" | "erro">("");

  async function salvar(valor: LabConfig) {
    setEstado("salvando");
    const res = await fetch("/api/admin/estudos/laboratorio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valor),
    }).catch(() => null);
    if (!res?.ok) return setEstado("erro");
    const { config: salvo } = await res.json();
    setC(salvo);
    setEstado("");
    setAberto(false);
    router.refresh();
  }

  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className={BOTAO_SECUNDARIO}>
        <Settings2 size={13} aria-hidden="true" /> Ajustar níveis
      </button>
    );
  }
  const campo = (k: keyof LabConfig, rotulo: string, min: number, max: number) => (
    <label className="block text-xs text-e-dim">
      {rotulo}
      <input
        type="number"
        min={min}
        max={max}
        value={c[k]}
        onChange={(ev) => setC({ ...c, [k]: Number(ev.target.value) })}
        className={CAMPO}
      />
    </label>
  );
  return (
    <div className="basis-full rounded-xl border border-e-line bg-e-card-2 p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {campo("acertosConsolidar", "Consolidado: acertos firmes seguidos, em dias diferentes", 2, 6)}
        {campo("diasDominado", "Dominado: dias que o acerto firme precisa durar", 7, 120)}
        {campo("vezesReincidencia", "Erro que se repete: quantos erros na mesma questão", 2, 5)}
      </div>
      {estado === "erro" && <p className="mt-2 text-xs text-e-bad">Não foi possível salvar. Tente de novo.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => salvar(c)} disabled={estado === "salvando"} className={BOTAO_PRIMARIO}>
          {estado === "salvando" ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={() => salvar(LAB_CONFIG_PADRAO)} className={BOTAO_SECUNDARIO}>
          Voltar ao padrão
        </button>
        <button type="button" onClick={() => { setC(config); setAberto(false); }} className={BOTAO_SECUNDARIO}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function CopiarResumo({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<"" | "ok" | "erro">("");
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("ok");
      setTimeout(() => setEstado(""), 2500);
    } catch {
      setEstado("erro");
    }
  }
  return (
    <button type="button" onClick={copiar} className={BOTAO_PRIMARIO}>
      {estado === "ok" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      {estado === "ok" ? "Copiado" : estado === "erro" ? "Selecione e copie à mão" : "Copiar resumo dos meus erros"}
    </button>
  );
}

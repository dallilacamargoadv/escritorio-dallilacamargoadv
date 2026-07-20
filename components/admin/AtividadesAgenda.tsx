"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AtividadeRow } from "@/components/admin/AtividadesAdminList";
import {
  addDaysToDateString,
  colunaDaAtividade,
  isAudiencia,
  todayBelemDateString,
  type AtividadeColuna,
} from "@/lib/atividades-utils";

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const COLUNA_CLASSES: Record<AtividadeColuna, string> = {
  atrasadas: "bg-error text-bg",
  hoje: "bg-warning text-bg",
  vencendo: "bg-gold text-bg",
  proximos: "bg-hairline-strong text-ink",
  concluidas: "bg-success text-bg",
};

const MAX_VISIVEIS_POR_DIA = 3;

function dateStringOf(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function AtividadesAgenda({ atividades }: { atividades: AtividadeRow[] }) {
  const hojeStr = useMemo(() => todayBelemDateString(), []);
  const [anoMes, setAnoMes] = useState(() => {
    const [ano, mes] = hojeStr.split("-").map(Number);
    return { ano, mes: mes - 1 };
  });

  const limite7 = useMemo(() => addDaysToDateString(hojeStr, 7), [hojeStr]);

  const atividadesPorDia = useMemo(() => {
    const map = new Map<string, AtividadeRow[]>();
    for (const atividade of atividades) {
      if (atividade.status === "cancelado") continue;
      const lista = map.get(atividade.data) ?? [];
      lista.push(atividade);
      map.set(atividade.data, lista);
    }
    return map;
  }, [atividades]);

  const primeiroDiaSemana = new Date(Date.UTC(anoMes.ano, anoMes.mes, 1)).getUTCDay();
  const diasNoMes = new Date(Date.UTC(anoMes.ano, anoMes.mes + 1, 0)).getUTCDate();

  const celulas: (number | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  function mudarMes(delta: number) {
    setAnoMes((prev) => {
      const data = new Date(Date.UTC(prev.ano, prev.mes + delta, 1));
      return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() };
    });
  }

  return (
    <div className="border border-hairline p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => mudarMes(-1)}
          aria-label="Mês anterior"
          className="text-ink-dim transition-colors duration-150 hover:text-gold"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="italic text-ink">
          {MESES[anoMes.mes]} de {anoMes.ano}
        </p>
        <button
          type="button"
          onClick={() => mudarMes(1)}
          aria-label="Próximo mês"
          className="text-ink-dim transition-colors duration-150 hover:text-gold"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-hairline">
        {DIAS_SEMANA.map((dia) => (
          <div key={dia} className="bg-bg py-1 text-center font-mono text-[9px] text-ink-dim">
            {dia}
          </div>
        ))}
        {celulas.map((dia, index) => {
          if (dia === null) return <div key={`vazio-${index}`} className="min-h-[76px] bg-bg" />;

          const dataStr = dateStringOf(anoMes.ano, anoMes.mes, dia);
          const doDia = atividadesPorDia.get(dataStr) ?? [];
          const isHoje = dataStr === hojeStr;
          const visiveis = doDia.slice(0, MAX_VISIVEIS_POR_DIA);
          const restante = doDia.length - visiveis.length;

          return (
            <div
              key={dataStr}
              className={`min-h-[76px] p-1 ${isHoje ? "bg-bg-alt ring-1 ring-inset ring-gold" : "bg-bg"}`}
            >
              <span className={`font-mono text-[9px] ${isHoje ? "text-gold" : "text-ink-dim"}`}>
                {dia}
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {visiveis.map((atividade) => {
                  const coluna = colunaDaAtividade(atividade, hojeStr, limite7) ?? "proximos";
                  const audiencia = isAudiencia(atividade);
                  return (
                    <Link
                      key={atividade.id}
                      href={`/admin/atividades/${atividade.id}`}
                      title={atividade.titulo}
                      className={`truncate px-1 py-0.5 text-[9px] font-semibold transition-opacity duration-150 hover:opacity-80 ${
                        audiencia ? "bg-audiencia text-bg" : COLUNA_CLASSES[coluna]
                      } ${atividade.status === "concluido" ? "line-through opacity-60" : ""}`}
                    >
                      {audiencia ? "⚠ " : ""}
                      {atividade.titulo}
                    </Link>
                  );
                })}
                {restante > 0 && (
                  <span className="px-1 text-[9px] text-ink-dim">+{restante} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-1.5 font-mono text-[9px] text-ink-dim">
        <span className="inline-block h-2.5 w-2.5 bg-audiencia" /> ⚠ Audiência — cor de alerta
        fixa, não muda com a urgência: não pode passar batido.
      </p>
    </div>
  );
}

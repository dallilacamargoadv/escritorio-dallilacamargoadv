"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import type { AtividadeRow } from "@/components/admin/AtividadesAdminList";
import { ATIVIDADE_TIPO_LABELS } from "@/lib/admin-labels";
import {
  addDaysToDateString,
  colunaDaAtividade,
  todayBelemDateString,
  type AtividadeColuna,
} from "@/lib/atividades-utils";
import { formatDate } from "@/lib/format";

const COLUNA_LABELS: Record<AtividadeColuna, string> = {
  atrasadas: "Atrasadas",
  hoje: "Vencem hoje",
  vencendo: "Vencendo (7d)",
  proximos: "Próximos dias",
  concluidas: "Concluídas",
};

const COLUNA_CORES: Record<AtividadeColuna, string> = {
  atrasadas: "text-error border-error",
  hoje: "text-warning border-warning",
  vencendo: "text-gold border-gold",
  proximos: "text-ink-dim border-hairline-strong",
  concluidas: "text-success border-success",
};

const COLUNAS: AtividadeColuna[] = ["atrasadas", "hoje", "vencendo", "proximos", "concluidas"];

export function AtividadesKanban({
  atividades,
  onChange,
}: {
  atividades: AtividadeRow[];
  onChange: (atividades: AtividadeRow[]) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const { hoje, limite7 } = useMemo(() => {
    const h = todayBelemDateString();
    return { hoje: h, limite7: addDaysToDateString(h, 7) };
  }, []);

  const porColuna = useMemo(() => {
    const map = new Map<AtividadeColuna, AtividadeRow[]>();
    for (const coluna of COLUNAS) map.set(coluna, []);
    for (const atividade of atividades) {
      const coluna = colunaDaAtividade(atividade, hoje, limite7);
      if (coluna) map.get(coluna)?.push(atividade);
    }
    return map;
  }, [atividades, hoje, limite7]);

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const id = active.id as string;
    const destino = over.id as AtividadeColuna;
    const atividade = atividades.find((a) => a.id === id);
    if (!atividade) return;

    const origemConcluida = atividade.status === "concluido";
    const destinoConcluida = destino === "concluidas";
    if (origemConcluida === destinoConcluida) return;

    const novoStatus = destinoConcluida ? "concluido" : "pendente";
    onChange(
      atividades.map((a) => (a.id === id ? { ...a, status: novoStatus } : a)),
    );

    await fetch(`/api/admin/atividades/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: atividade.tipo,
        titulo: atividade.titulo,
        data: atividade.data,
        hora: atividade.hora,
        caso_frente_id: atividade.caso_frente_id,
        caso_id: atividade.caso_id,
        cliente_id: atividade.cliente_id,
        status: novoStatus,
        visivel_cliente: atividade.visivel_cliente,
      }),
    });
  }

  const activeAtividade = atividades.find((a) => a.id === activeId) ?? null;

  return (
    <DndContext
      id="atividades-kanban"
      sensors={sensors}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <p className="mb-2 text-[11px] text-ink-dim">
        Arraste um card pra &ldquo;Concluídas&rdquo; pra marcar como feito (ou de volta, pra
        reabrir). As outras colunas são automáticas por data — pra reagendar, edite a atividade.
      </p>
      <div className="flex gap-px overflow-x-auto border border-hairline bg-hairline">
        {COLUNAS.map((coluna) => (
          <KanbanColuna
            key={coluna}
            coluna={coluna}
            atividades={porColuna.get(coluna) ?? []}
          />
        ))}
      </div>
      <DragOverlay>
        {activeAtividade ? <AtividadeCard atividade={activeAtividade} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColuna({
  coluna,
  atividades,
}: {
  coluna: AtividadeColuna;
  atividades: AtividadeRow[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: coluna });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-52 shrink-0 flex-col bg-bg transition-colors duration-150 ${isOver ? "bg-bg-alt" : ""}`}
    >
      <div className={`border-b px-3 py-2 ${COLUNA_CORES[coluna]}`}>
        <p className="truncate font-mono text-[9.5px] uppercase tracking-wide">
          {COLUNA_LABELS[coluna]}
        </p>
        <p className="mt-1 font-mono text-base tabular-nums">{atividades.length}</p>
      </div>
      <div className="flex max-h-[560px] flex-1 flex-col gap-1.5 overflow-y-auto p-2">
        {atividades.length === 0 && (
          <p className="py-4 text-center text-[10.5px] text-ink-dim">—</p>
        )}
        {atividades.map((atividade) => (
          <DraggableAtividadeCard key={atividade.id} atividade={atividade} />
        ))}
      </div>
    </div>
  );
}

function DraggableAtividadeCard({ atividade }: { atividade: AtividadeRow }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: atividade.id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <AtividadeCard atividade={atividade} />
    </div>
  );
}

function AtividadeCard({
  atividade,
  dragging,
}: {
  atividade: AtividadeRow;
  dragging?: boolean;
}) {
  return (
    <Link
      href={`/admin/atividades/${atividade.id}`}
      className={`block border border-hairline bg-surface p-2 text-left text-xs transition-colors duration-150 hover:border-gold ${
        dragging ? "shadow-lg" : ""
      } ${atividade.status === "concluido" ? "opacity-60" : ""}`}
    >
      <p className={`truncate text-ink ${atividade.status === "concluido" ? "line-through" : ""}`}>
        {atividade.titulo}
      </p>
      <p className="mt-0.5 truncate text-[10px] text-ink-dim">
        {ATIVIDADE_TIPO_LABELS[atividade.tipo]} · {formatDate(atividade.data)}
      </p>
    </Link>
  );
}

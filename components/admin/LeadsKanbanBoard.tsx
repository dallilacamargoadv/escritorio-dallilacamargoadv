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
import type { Lead, LeadStatus } from "@/lib/db-admin";
import { FORM_TYPE_LABELS, STATUS_LABELS } from "@/lib/admin-labels";
import { CADENCIA_STATUSES, diasDesde } from "@/lib/leads-cadencia";
import { LeadDetailModal } from "@/components/admin/LeadDetailModal";
import { NovoLeadModal } from "@/components/admin/NovoLeadModal";

// "cliente" fica de fora de propósito — ao converter, o lead sai do quadro
// (continua existindo, visível na aba Lista e como registro em Clientes).
const COLUMNS: LeadStatus[] = [
  "leads",
  "contactados",
  "em_andamento",
  "proposta_enviada",
  "link_enviado",
  "f1_01_dia",
  "f2_02_dias",
  "f3_03_dias",
  "f4_05_dias",
  "f5_07_dias",
  "f6_10_dias",
  "f7_12_dias",
  "f8_15_dias",
  "grupo_criado",
  "reuniao_agendada",
  "salesfarming",
  "perdido",
];

const CADENCIA_SET = new Set(CADENCIA_STATUSES);

export function LeadsKanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showNovoLead, setShowNovoLead] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const leadsByStatus = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>();
    for (const status of COLUMNS) map.set(status, []);
    for (const lead of leads) {
      if (lead.status === "cliente") continue;
      map.get(lead.status)?.push(lead);
    }
    return map;
  }, [leads]);

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: newStatus,
              first_contacted_at:
                newStatus !== "leads" && !l.first_contacted_at
                  ? new Date().toISOString()
                  : l.first_contacted_at,
            }
          : l,
      ),
    );

    await fetch(`/api/admin/leads/${leadId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  function handleLeadUpdate(updated: Lead) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  }

  const activeLead = leads.find((l) => l.id === activeId) ?? null;
  const visibleCount = leads.filter((l) => l.status !== "cliente").length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-ink-dim">
          {visibleCount} leads ativos no quadro
        </p>
        <button
          type="button"
          onClick={() => setShowNovoLead(true)}
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          + Novo lead
        </button>
      </div>

      <DndContext
        id="leads-kanban"
        sensors={sensors}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="mt-4 flex gap-px overflow-x-auto border border-hairline bg-hairline">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={leadsByStatus.get(status) ?? []}
              onOpenLead={setSelectedLead}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} dragging /> : null}
        </DragOverlay>
      </DndContext>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}

      {showNovoLead && (
        <NovoLeadModal
          onClose={() => setShowNovoLead(false)}
          onCreated={(lead) => setLeads((prev) => [lead, ...prev])}
        />
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  leads,
  onOpenLead,
}: {
  status: LeadStatus;
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const isCadencia = CADENCIA_SET.has(status);
  const isEncerramento = status === "f8_15_dias";

  return (
    <div
      ref={setNodeRef}
      className={`flex w-52 shrink-0 flex-col bg-bg transition-colors duration-150 ${isOver ? "bg-bg-alt" : ""}`}
    >
      <div className="border-b border-hairline px-3 py-2">
        <p className="truncate font-mono text-[9.5px] uppercase tracking-wide text-ink-dim">
          {STATUS_LABELS[status]}
        </p>
        <p
          className={`mt-1 font-mono text-base tabular-nums ${
            isEncerramento ? "text-error" : isCadencia ? "text-warning" : "text-ink"
          }`}
        >
          {leads.length}
        </p>
      </div>
      <div className="flex max-h-[560px] flex-1 flex-col gap-1.5 overflow-y-auto p-2">
        {leads.length === 0 && (
          <p className="py-4 text-center text-[10.5px] text-ink-dim">—</p>
        )}
        {leads.map((lead) => (
          <DraggableLeadCard
            key={lead.id}
            lead={lead}
            onOpen={() => onOpenLead(lead)}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableLeadCard({
  lead,
  onOpen,
}: {
  lead: Lead;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <LeadCard lead={lead} onClick={onOpen} />
    </div>
  );
}

function LeadCard({
  lead,
  dragging,
  onClick,
}: {
  lead: Lead;
  dragging?: boolean;
  onClick?: () => void;
}) {
  const showDias = CADENCIA_SET.has(lead.status) && lead.first_contacted_at;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border border-hairline bg-surface p-2 text-left text-xs transition-colors duration-150 hover:border-gold ${
        dragging ? "shadow-lg" : ""
      }`}
    >
      <p className="truncate text-ink">{lead.name}</p>
      <p className="mt-0.5 truncate text-[10px] text-ink-dim">
        {FORM_TYPE_LABELS[lead.form_type] ?? lead.form_type}
      </p>
      {showDias && (
        <span
          className={`mt-1 inline-block border px-1.5 py-0.5 font-mono text-[9px] ${
            lead.status === "f8_15_dias"
              ? "border-error text-error"
              : "border-warning text-warning"
          }`}
        >
          {diasDesde(lead.first_contacted_at as string)} dias sem retorno
        </span>
      )}
    </button>
  );
}

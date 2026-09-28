"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import type {
  ConteudoEditorial,
  ContentCanal,
  ContentFormato,
  ContentPilar,
} from "@/lib/db-conteudo-editorial";
import { CANAL_LABELS, FORMATO_LABELS, PILAR_LABELS } from "@/lib/admin-labels";
import { GuiaPilaresPanel } from "@/components/admin/GuiaPilaresPanel";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
/** Ritmo semanal sugerido (ver Guia de Pilares): seg-qui = conteúdo principal,
 * sex-dom = só stories leves (+ 1 trend/pessoal em algum dia do fim de semana). */
const RITMO_DIA_SEMANA = ["stories", "principal", "principal", "principal", "principal", "stories", "stories"] as const;

const PILAR_BORDER: Record<ContentPilar, string> = {
  topo: "border-l-chart-6",
  meio: "border-l-chart-1",
  fundo: "border-l-chart-5",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dataStr(ano: number, mes: number, dia: number) {
  return `${ano}-${pad(mes)}-${pad(dia)}`;
}

interface NovoForm {
  dia: number;
  canal: ContentCanal;
  formato: ContentFormato;
  pilar: ContentPilar;
  tema: string;
  utm_content: string;
}

export function CalendarioEditorialClient({
  ano,
  mes,
  conteudosIniciais,
}: {
  ano: number;
  mes: number;
  conteudosIniciais: ConteudoEditorial[];
}) {
  const router = useRouter();
  const [conteudos, setConteudos] = useState(conteudosIniciais);
  const [novoDia, setNovoDia] = useState<number | null>(null);
  const [novoForm, setNovoForm] = useState<NovoForm | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const porDia = useMemo(() => {
    const mapa = new Map<number, ConteudoEditorial[]>();
    for (const c of conteudos) {
      const dia = Number(c.data.split("-")[2]);
      const lista = mapa.get(dia) ?? [];
      lista.push(c);
      mapa.set(dia, lista);
    }
    return mapa;
  }, [conteudos]);

  const diasNoMes = new Date(ano, mes, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
  const celulas: (number | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  function irPara(novoMes: number, novoAno: number) {
    router.push(`/admin/marketing/calendario?ano=${novoAno}&mes=${novoMes}`);
  }

  function mesAnterior() {
    if (mes === 1) irPara(12, ano - 1);
    else irPara(mes - 1, ano);
  }
  function mesSeguinte() {
    if (mes === 12) irPara(1, ano + 1);
    else irPara(mes + 1, ano);
  }

  async function togglePublicado(c: ConteudoEditorial) {
    const novoValor = !c.publicado;
    setConteudos((prev) => prev.map((x) => (x.id === c.id ? { ...x, publicado: novoValor } : x)));
    const res = await fetch(`/api/admin/conteudo-editorial/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicado: novoValor }),
    });
    if (res.ok) {
      const { conteudo } = await res.json();
      setConteudos((prev) => prev.map((x) => (x.id === c.id ? conteudo : x)));
    }
  }

  async function moverConteudo(c: ConteudoEditorial, novaData: string) {
    setConteudos((prev) => prev.map((x) => (x.id === c.id ? { ...x, data: novaData } : x)));
    const res = await fetch(`/api/admin/conteudo-editorial/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: novaData }),
    });
    if (res.ok) {
      const { conteudo } = await res.json();
      setConteudos((prev) => prev.map((x) => (x.id === c.id ? conteudo : x)));
    }
  }

  async function salvarMetricas(c: ConteudoEditorial, alcance: string, interacoes: string) {
    const body = {
      alcance: alcance === "" ? null : Number(alcance),
      interacoes: interacoes === "" ? null : Number(interacoes),
    };
    const res = await fetch(`/api/admin/conteudo-editorial/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const { conteudo } = await res.json();
      setConteudos((prev) => prev.map((x) => (x.id === c.id ? conteudo : x)));
    }
  }

  function abrirNovo(dia: number) {
    setNovoDia(dia);
    setNovoForm({
      dia,
      canal: "instagram",
      formato: "post",
      pilar: "meio",
      tema: "",
      utm_content: "",
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const c = conteudos.find((x) => x.id === active.id);
    if (!c) return;
    const novaData = dataStr(ano, mes, Number(over.id));
    if (novaData === c.data) return;
    moverConteudo(c, novaData);
  }

  const activeConteudo = conteudos.find((c) => c.id === activeId) ?? null;

  async function salvarNovo() {
    if (!novoForm || !novoForm.tema.trim()) return;
    setSalvando(true);
    const res = await fetch("/api/admin/conteudo-editorial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: dataStr(ano, mes, novoForm.dia),
        canal: novoForm.canal,
        formato: novoForm.formato,
        pilar: novoForm.pilar,
        tema: novoForm.tema.trim(),
        utm_content: novoForm.utm_content.trim() || null,
      }),
    });
    setSalvando(false);
    if (res.ok) {
      const { conteudo } = await res.json();
      setConteudos((prev) => [...prev, conteudo]);
      setNovoDia(null);
      setNovoForm(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <p className="font-eyebrow text-[10px] text-ink-dim">Marketing</p>
        <h1 className="mt-3 text-lg italic text-ink">Calendário Editorial</h1>
        <p className="mt-2 text-sm text-ink-dim">
          Mesmo formato do calendário da sua mentora — cor por etapa do funil, um conteúdo por
          dia. Marcar como publicado cria o compromisso em Atividades sozinho.
        </p>
      </div>

      <GuiaPilaresPanel />

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={mesAnterior}
          className="border border-hairline-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-dim hover:border-gold hover:text-gold"
        >
          ← {MESES[mes === 1 ? 11 : mes - 2]}
        </button>
        <h2 className="font-display text-lg italic text-ink">
          {MESES[mes - 1]} {ano}
        </h2>
        <button
          onClick={mesSeguinte}
          className="border border-hairline-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-dim hover:border-gold hover:text-gold"
        >
          {MESES[mes === 12 ? 0 : mes]} →
        </button>
      </div>

      <p className="mt-6 text-xs text-ink-dim">
        Arraste um card (ainda não publicado) pra outro dia pra reagendar.
      </p>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
      <div className="mt-2 grid grid-cols-7 gap-px border border-hairline bg-hairline">
        {DIAS_SEMANA.map((d, i) => (
          <div key={d} className="bg-bg-alt px-2 py-1.5 font-mono text-[9.5px] uppercase tracking-wide text-ink-dim">
            {d}
            <span className={`ml-1.5 normal-case ${RITMO_DIA_SEMANA[i] === "stories" ? "text-ink-dim" : "text-gold"}`}>
              · {RITMO_DIA_SEMANA[i]}
            </span>
          </div>
        ))}

        {celulas.map((dia, i) => {
          if (dia === null) return <div key={`empty-${i}`} className="min-h-[120px] bg-bg-alt" />;
          const itens = porDia.get(dia) ?? [];
          return (
            <DiaCelula key={dia} dia={dia}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-ink-dim">{dia}</span>
                <button
                  onClick={() => abrirNovo(dia)}
                  className="font-mono text-[10px] text-ink-dim hover:text-gold"
                  aria-label={`Adicionar conteúdo no dia ${dia}`}
                >
                  +
                </button>
              </div>

              {itens.map((c) => (
                <DraggableConteudoCard key={c.id} c={c} onToggle={togglePublicado} onSalvarMetricas={salvarMetricas} />
              ))}

              {novoDia === dia && novoForm && (
                <div className="mt-1 space-y-1.5 border border-gold bg-bg-alt p-2">
                  <select
                    value={novoForm.canal}
                    onChange={(e) => setNovoForm({ ...novoForm, canal: e.target.value as ContentCanal })}
                    className="w-full border border-hairline-strong bg-surface px-1 py-1 text-[11px] text-ink"
                  >
                    {Object.entries(CANAL_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <select
                    value={novoForm.formato}
                    onChange={(e) => setNovoForm({ ...novoForm, formato: e.target.value as ContentFormato })}
                    className="w-full border border-hairline-strong bg-surface px-1 py-1 text-[11px] text-ink"
                  >
                    {Object.entries(FORMATO_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <select
                    value={novoForm.pilar}
                    onChange={(e) => setNovoForm({ ...novoForm, pilar: e.target.value as ContentPilar })}
                    className="w-full border border-hairline-strong bg-surface px-1 py-1 text-[11px] text-ink"
                  >
                    {Object.entries(PILAR_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <textarea
                    value={novoForm.tema}
                    onChange={(e) => setNovoForm({ ...novoForm, tema: e.target.value })}
                    placeholder="Tema do conteúdo"
                    rows={2}
                    className="w-full resize-none border border-hairline-strong bg-surface px-1 py-1 text-[11px] text-ink"
                  />
                  <input
                    value={novoForm.utm_content}
                    onChange={(e) => setNovoForm({ ...novoForm, utm_content: e.target.value })}
                    placeholder="utm_content (opcional)"
                    className="w-full border border-hairline-strong bg-surface px-1 py-1 text-[11px] text-ink"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={salvarNovo}
                      disabled={salvando}
                      className="flex-1 bg-gold px-2 py-1 font-mono text-[10px] uppercase text-bg disabled:opacity-50"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => { setNovoDia(null); setNovoForm(null); }}
                      className="border border-hairline-strong px-2 py-1 font-mono text-[10px] uppercase text-ink-dim"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </DiaCelula>
          );
        })}
      </div>

      <DragOverlay>
        {activeConteudo ? (
          <ConteudoCard c={activeConteudo} onToggle={togglePublicado} onSalvarMetricas={salvarMetricas} dragging />
        ) : null}
      </DragOverlay>
      </DndContext>

      <div className="mt-6 flex flex-wrap gap-5 text-xs text-ink-dim">
        <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 bg-chart-6" /> Topo de funil</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 bg-chart-1" /> Meio de funil</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 bg-chart-5" /> Fundo de funil</span>
      </div>
    </div>
  );
}

function extrairLinkSugerido(observacoes: string | null): string | null {
  if (!observacoes) return null;
  const match = observacoes.match(/Link sugerido:\s*(\S+)/);
  return match ? match[1] : null;
}

/** Monta o link final com UTM a partir da base salva em observações +
 * o utm_content já gerado no lançamento do conteúdo. */
function montarLinkComUtm(baseUrl: string, utmContent: string | null): string {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", "instagram");
  url.searchParams.set("utm_medium", "bio");
  url.searchParams.set("utm_campaign", "calendario-outubro");
  if (utmContent) url.searchParams.set("utm_content", utmContent);
  return url.toString();
}

/** Célula de dia — área onde um card arrastado pode ser solto. */
function DiaCelula({ dia, children }: { dia: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: String(dia) });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[120px] flex-col gap-1.5 bg-surface p-1.5 transition-colors duration-150 ${
        isOver ? "bg-bg-alt ring-1 ring-inset ring-gold" : ""
      }`}
    >
      {children}
    </div>
  );
}

/** Card arrastável — só conteúdo ainda não publicado pode ser movido de dia. */
function DraggableConteudoCard({
  c,
  onToggle,
  onSalvarMetricas,
}: {
  c: ConteudoEditorial;
  onToggle: (c: ConteudoEditorial) => void;
  onSalvarMetricas: (c: ConteudoEditorial, alcance: string, interacoes: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: c.id,
    disabled: c.publicado,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...(c.publicado ? {} : { ...listeners, ...attributes })}>
      <ConteudoCard c={c} onToggle={onToggle} onSalvarMetricas={onSalvarMetricas} />
    </div>
  );
}

function ConteudoCard({
  c,
  onToggle,
  onSalvarMetricas,
  dragging,
}: {
  c: ConteudoEditorial;
  onToggle: (c: ConteudoEditorial) => void;
  onSalvarMetricas: (c: ConteudoEditorial, alcance: string, interacoes: string) => void;
  dragging?: boolean;
}) {
  const [alcance, setAlcance] = useState(c.alcance?.toString() ?? "");
  const [interacoes, setInteracoes] = useState(c.interacoes?.toString() ?? "");
  const [editandoMetricas, setEditandoMetricas] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const linkBase = extrairLinkSugerido(c.observacoes);
  const link = linkBase ? montarLinkComUtm(linkBase, c.utm_content) : null;

  async function copiarLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // clipboard indisponível — sem tratamento, o link já aparece em texto
    }
  }

  return (
    <div className={`border-l-2 bg-bg-alt p-1.5 ${PILAR_BORDER[c.pilar]} ${dragging ? "shadow-lg" : ""} ${!c.publicado ? "cursor-grab active:cursor-grabbing" : ""}`}>
      <p className="font-mono text-[9px] uppercase tracking-wide text-ink-dim">
        {FORMATO_LABELS[c.formato]}
      </p>
      <p className="mt-0.5 line-clamp-3 text-[11px] leading-snug text-ink">{c.tema}</p>
      {link && (
        <button
          onClick={copiarLink}
          className="mt-1 truncate font-mono text-[9px] text-gold underline underline-offset-2"
          title={link}
        >
          {copiado ? "link copiado ✓" : "copiar link com UTM"}
        </button>
      )}
      <label className="mt-1 flex items-center gap-1.5 text-[10px] text-ink-dim">
        <input
          type="checkbox"
          checked={c.publicado}
          onChange={() => onToggle(c)}
          className="h-3 w-3 accent-gold"
        />
        publicado
      </label>

      {!c.publicado && (
        <p className="mt-1 font-mono text-[9px] text-ink-dim">↕ arraste pra outro dia</p>
      )}

      {c.publicado && (
        <button
          onClick={() => setEditandoMetricas((v) => !v)}
          className="mt-1 font-mono text-[9px] text-ink-dim underline underline-offset-2"
        >
          {editandoMetricas ? "fechar métricas" : c.alcance !== null ? `${c.alcance} alcance` : "+ métricas"}
        </button>
      )}

      {editandoMetricas && (
        <div className="mt-1 flex gap-1">
          <input
            type="number"
            value={alcance}
            onChange={(e) => setAlcance(e.target.value)}
            onBlur={() => onSalvarMetricas(c, alcance, interacoes)}
            placeholder="alcance"
            className="w-1/2 border border-hairline-strong bg-surface px-1 py-0.5 text-[10px] text-ink"
          />
          <input
            type="number"
            value={interacoes}
            onChange={(e) => setInteracoes(e.target.value)}
            onBlur={() => onSalvarMetricas(c, alcance, interacoes)}
            placeholder="interações"
            className="w-1/2 border border-hairline-strong bg-surface px-1 py-0.5 text-[10px] text-ink"
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { formatarData } from "@/lib/estudos-utils";
import { TAMANHOS_LEI_SECA, formatarDuracao, TAMANHOS_SIMULADAO, TIPO_LABEL, type SemanaSimulados, type Simulado } from "@/lib/estudos-simulados";
import { Sparkle } from "@/components/estudos/Sparkle";
import { Barra, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, Card, CardTitulo, Kpi, tomPorPct } from "@/components/estudos/ui";

interface MateriaPool {
  id: string;
  nome: string;
  total: number;
  ineditas: number;
}
interface LinhaDistribuicao {
  materia_id: string;
  nome: string;
  n: number;
  disponiveis: number;
  ineditas: number;
}

function Opcao({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`rounded-full border px-3 py-1.5 text-xs transition-colors duration-150 ${ativo ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"}`}
    >
      {children}
    </button>
  );
}

export function SimuladosClient(p: {
  hoje: string;
  totalBanco: number;
  ineditas: number;
  materias: MateriaPool[];
  distribuicoes: Record<number, LinhaDistribuicao[]>;
  simulados: Simulado[];
  evolucao: SemanaSimulados[];
  todasMaterias: { id: string; nome: string }[];
}) {
  const router = useRouter();
  const diaSemana = new Date(`${p.hoje}T12:00:00Z`).getUTCDay();
  const [tipo, setTipo] = useState<"lei_seca" | "simuladao">(diaSemana === 0 ? "simuladao" : "lei_seca");
  const [materia, setMateria] = useState(p.materias[0]?.id ?? "");
  const [nLei, setNLei] = useState(20);
  const [nMisto, setNMisto] = useState(50);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");

  const andamento = p.simulados.filter((s) => s.status === "em_andamento");
  const entregues = p.simulados.filter((s) => s.status === "entregue").sort((a, b) => b.data.localeCompare(a.data));
  const ultimo = entregues[0];
  const pctDe = (s: Simulado) => (s.total && s.acertos !== null ? Math.round((s.acertos / s.total) * 100) : 0);

  const pool = p.materias.find((m) => m.id === materia);
  const dist = p.distribuicoes[nMisto] ?? [];
  const repetidas =
    tipo === "lei_seca"
      ? Math.max(0, Math.min(nLei, pool?.total ?? 0) - (pool?.ineditas ?? 0))
      : dist.reduce((s, d) => s + Math.max(0, d.n - d.ineditas), 0);
  const tamanho = tipo === "lei_seca" ? Math.min(nLei, pool?.total ?? 0) : dist.reduce((s, d) => s + d.n, 0);

  async function iniciar() {
    setCriando(true);
    setErro("");
    const res = await fetch("/api/admin/estudos/simulados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "criar", tipo, total: tipo === "lei_seca" ? nLei : nMisto, materia_id: tipo === "lei_seca" ? materia : null }),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok || !j?.id) {
      setErro(j?.error ?? "Não foi possível montar o simulado");
      setCriando(false);
      return;
    }
    router.push(`/admin/estudos/simulados?id=${j.id}`);
  }

  async function apagar(id: string) {
    if (!confirm("Apagar este registro?")) return;
    await fetch(`/api/admin/estudos/simulados/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const maxPct = 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          rotulo="Questões inéditas no banco"
          valor={`${p.ineditas}`}
          detalhe={p.ineditas ? `de ${p.totalBanco}` : "todas já vistas: os simulados repetem as mais antigas"}
          tom={p.ineditas > 100 ? "ok" : p.ineditas > 30 ? "warn" : "bad"}
        />
        <Kpi rotulo="Simulados feitos" valor={`${entregues.length}`} detalhe={`${entregues.filter((s) => s.origem === "externo").length} registrados de fora`} />
        <Kpi rotulo="Último" valor={ultimo ? `${pctDe(ultimo)}%` : "–"} detalhe={ultimo ? `${TIPO_LABEL[ultimo.tipo]} · ${formatarData(ultimo.data)}` : "nenhum ainda"} tom={ultimo ? tomPorPct(pctDe(ultimo)) : undefined} />
        <Kpi
          rotulo="Esta semana"
          valor={p.evolucao.at(-1) ? `${p.evolucao.at(-1)!.pct}%` : "–"}
          detalhe={p.evolucao.length > 1 ? `semana anterior: ${p.evolucao.at(-2)!.pct}%` : "a evolução aparece com 2 semanas"}
          tom={p.evolucao.at(-1) ? tomPorPct(p.evolucao.at(-1)!.pct) : undefined}
        />
      </div>

      {andamento.length > 0 && (
        <Card destaque>
          <CardTitulo>Em andamento</CardTitulo>
          <ul className="space-y-2">
            {andamento.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-e-ink">
                  {TIPO_LABEL[s.tipo]}
                  {s.materia_id ? ` · ${p.todasMaterias.find((m) => m.id === s.materia_id)?.nome ?? ""}` : ""} · {s.total} questões · {formatarData(s.data)}
                </span>
                <Link href={`/admin/estudos/simulados?id=${s.id}`} className={BOTAO_PRIMARIO}>
                  Continuar
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardTitulo>
          <span className="inline-flex items-center gap-2">
            <Sparkle size={14} /> Montar simulado
          </span>
        </CardTitulo>
        <div className="flex flex-wrap gap-2">
          <Opcao ativo={tipo === "lei_seca"} onClick={() => setTipo("lei_seca")}>
            Lei seca de uma matéria (quarta)
          </Opcao>
          <Opcao ativo={tipo === "simuladao"} onClick={() => setTipo("simuladao")}>
            Simuladão misto (domingo)
          </Opcao>
        </div>

        {tipo === "lei_seca" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-e-dim">
              Matéria
              <select className={CAMPO} value={materia} onChange={(e) => setMateria(e.target.value)}>
                {p.materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} ({m.ineditas} inéditas de {m.total})
                  </option>
                ))}
              </select>
            </label>
            <div className="text-xs text-e-dim">
              Questões
              <div className="mt-1 flex gap-2">
                {TAMANHOS_LEI_SECA.map((n) => (
                  <Opcao key={n} ativo={nLei === n} onClick={() => setNLei(n)}>
                    {n}
                  </Opcao>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              {TAMANHOS_SIMULADAO.map((n) => (
                <Opcao key={n} ativo={nMisto === n} onClick={() => setNMisto(n)}>
                  {n} questões
                </Opcao>
              ))}
            </div>
            <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {dist.map((d) => (
                <li key={d.materia_id} className="flex justify-between gap-2">
                  <span className="text-e-ink">{d.nome}</span>
                  <span className={`tabular-nums ${d.n > d.ineditas ? "text-e-warn" : "text-e-dim"}`}>
                    {d.n} {d.n > d.ineditas ? `(${d.n - d.ineditas} repetidas)` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-e-dim">
              Proporção pelo número de tópicos de cada matéria no edital. Matérias sem questões no banco ainda (História, Geografia e Cultura do MA, Atualidades, Direitos Humanos, Financeiro, Ambiental, Trabalho e Previdenciário) ficam de fora.
            </p>
          </div>
        )}

        {repetidas > 0 && (
          <p className="mt-3 rounded-xl border border-e-warn/50 bg-e-warn-soft px-3 py-2 text-sm text-e-warn">
            Atenção: {repetidas} de {tamanho} questões já foram respondidas antes e vão se repetir (entram primeiro as vistas há mais tempo).
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className={BOTAO_PRIMARIO} onClick={iniciar} disabled={criando || !tamanho}>
            {criando ? "Montando..." : `Começar (${tamanho} questões, ${formatarDuracao(tamanho * 180)})`}
          </button>
          <span className="text-xs text-e-dim">Tempo de referência: 3 min por questão. Os erros vão para a Revisão.</span>
        </div>
        {erro && <p className="mt-2 text-sm text-e-bad">{erro}</p>}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitulo>Evolução semanal</CardTitulo>
          {p.evolucao.length ? (
            <ul className="space-y-2.5">
              {p.evolucao.map((s) => (
                <li key={s.semana} className="text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-e-ink">Semana de {formatarData(s.semana)}</span>
                    <span className="tabular-nums text-e-dim">
                      {s.pct}% · {s.feitos} simulado{s.feitos > 1 ? "s" : ""} · {s.questoes} questões
                    </span>
                  </div>
                  <div className="mt-1 flex">
                    <Barra pct={(s.pct / maxPct) * 100} tom={tomPorPct(s.pct)} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-e-dim">Ainda sem simulados entregues. A evolução soma os feitos aqui e os registrados de fora.</p>
          )}
        </Card>
        <RegistroExterno hoje={p.hoje} materias={p.todasMaterias} />
      </div>

      <Card>
        <CardTitulo>Histórico</CardTitulo>
        {entregues.length ? (
          <ul className="divide-y divide-e-line">
            {entregues.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                <span className="w-12 tabular-nums text-e-dim">{formatarData(s.data)}</span>
                <span className="min-w-0 flex-1 text-e-ink">
                  {TIPO_LABEL[s.tipo]}
                  {s.materia_id ? ` · ${p.todasMaterias.find((m) => m.id === s.materia_id)?.nome ?? ""}` : ""}
                  <span className="block text-xs text-e-dim">
                    {s.origem === "externo" ? `Feito fora · ${s.fonte ?? ""}` : "No site"}
                    {s.duracao_seg ? ` · ${formatarDuracao(s.duracao_seg)}` : ""}
                    {s.nota ? ` · ${s.nota}` : ""}
                  </span>
                </span>
                <span className={`tabular-nums ${tomPorPct(pctDe(s)) === "ok" ? "text-e-ok" : tomPorPct(pctDe(s)) === "warn" ? "text-e-warn" : "text-e-bad"}`}>
                  {s.acertos}/{s.total} · {pctDe(s)}%
                </span>
                {s.origem === "site" ? (
                  <Link href={`/admin/estudos/simulados?id=${s.id}`} className={BOTAO_SECUNDARIO}>
                    Relatório
                  </Link>
                ) : (
                  <button type="button" className={BOTAO_SECUNDARIO} onClick={() => apagar(s.id)} aria-label="Apagar registro">
                    <Trash2 size={13} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-e-dim">Nenhum simulado entregue ainda.</p>
        )}
      </Card>
    </div>
  );
}

function RegistroExterno({ hoje, materias }: { hoje: string; materias: { id: string; nome: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState({ data: hoje, tipo: "simuladao", materia_id: "", total: "", acertos: "", minutos: "", fonte: "TEC Concursos", nota: "" });
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");
  const muda = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setMsg("");
    const res = await fetch("/api/admin/estudos/simulados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "externo", ...f, materia_id: f.materia_id || null, total: Number(f.total), acertos: Number(f.acertos), minutos: Number(f.minutos) }),
    });
    setSalvando(false);
    if (!res.ok) {
      setMsg((await res.json().catch(() => null))?.error ?? "Não foi possível salvar");
      return;
    }
    setF({ ...f, total: "", acertos: "", minutos: "", nota: "" });
    setMsg("Registrado.");
    router.refresh();
  }

  return (
    <Card>
      <CardTitulo>Registrar simulado feito fora</CardTitulo>
      <form onSubmit={salvar} className="grid grid-cols-2 gap-3">
        <label className="text-xs text-e-dim">
          Data
          <input type="date" className={CAMPO} value={f.data} onChange={muda("data")} required />
        </label>
        <label className="text-xs text-e-dim">
          Tipo
          <select className={CAMPO} value={f.tipo} onChange={muda("tipo")}>
            <option value="simuladao">Simuladão</option>
            <option value="lei_seca">Lei seca</option>
            <option value="outro">Outro</option>
          </select>
        </label>
        <label className="col-span-2 text-xs text-e-dim">
          Matéria (deixe em branco se for misto)
          <select className={CAMPO} value={f.materia_id} onChange={muda("materia_id")}>
            <option value="">Misto</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-e-dim">
          Questões
          <input type="number" min={1} className={CAMPO} value={f.total} onChange={muda("total")} required />
        </label>
        <label className="text-xs text-e-dim">
          Acertos
          <input type="number" min={0} className={CAMPO} value={f.acertos} onChange={muda("acertos")} required />
        </label>
        <label className="text-xs text-e-dim">
          Tempo (min, opcional)
          <input type="number" min={0} className={CAMPO} value={f.minutos} onChange={muda("minutos")} />
        </label>
        <label className="text-xs text-e-dim">
          Onde
          <input className={CAMPO} value={f.fonte} onChange={muda("fonte")} />
        </label>
        <label className="col-span-2 text-xs text-e-dim">
          Observação (opcional)
          <input className={CAMPO} value={f.nota} onChange={muda("nota")} placeholder="ex.: simulado 3 do TEC, PGE-AM 2022" />
        </label>
        <div className="col-span-2 flex items-center gap-3">
          <button type="submit" className={BOTAO_PRIMARIO} disabled={salvando}>
            {salvando ? "Salvando..." : "Registrar nota"}
          </button>
          {msg && <span className="text-xs text-e-dim">{msg}</span>}
        </div>
      </form>
    </Card>
  );
}

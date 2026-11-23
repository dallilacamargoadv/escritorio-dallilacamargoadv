"use client";

import { useState } from "react";
import Link from "next/link";
import { CLASSIFICACAO_LABEL, formatarTempo, TIPOS_ACERTO, TIPOS_ERRO, type Classificacao, type Questao } from "@/lib/estudos-desempenho";
import { fonteHtml, htmlSeguro } from "@/lib/estudos-html";
import { formatarDuracao, SEG_POR_QUESTAO, type Simulado } from "@/lib/estudos-simulados";
import { Barra, BOTAO_SECUNDARIO, Card, CardTitulo, CAMPO, Kpi, tomPorPct } from "@/components/estudos/ui";

const LETRAS = ["A", "B", "C", "D", "E"];

export function SimuladoRelatorio({ simulado, questoes }: { simulado: Simulado; questoes: (Questao & { materia: string })[] }) {
  const [itens, setItens] = useState(simulado.itens);
  const [aberta, setAberta] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const qPorId = new Map(questoes.map((q) => [q.id, q]));

  const total = itens.length;
  const acertos = itens.filter((i) => i.correta).length;
  const pct = total ? Math.round((acertos / total) * 100) : 0;
  const brancas = itens.filter((i) => i.alternativa === null).length;
  const duracao = simulado.duracao_seg ?? itens.reduce((s, i) => s + i.tempo_seg, 0);
  const lentas = itens.filter((i) => i.tempo_seg > SEG_POR_QUESTAO).length;
  const incertos = itens.filter((i) => i.correta && (i.classificacao === "chute" || i.classificacao === "duvida")).length;

  const porMateria = new Map<string, { n: number; ok: number; tempo: number }>();
  for (const i of itens) {
    const m = qPorId.get(i.questao_id)?.materia ?? "?";
    const l = porMateria.get(m) ?? { n: 0, ok: 0, tempo: 0 };
    l.n++;
    if (i.correta) l.ok++;
    l.tempo += i.tempo_seg;
    porMateria.set(m, l);
  }
  const porGrupo = { direito: { n: 0, ok: 0 }, gerais: { n: 0, ok: 0 } };
  for (const i of itens) {
    const q = qPorId.get(i.questao_id);
    if (!q) continue;
    const g = q.materia_id.startsWith("B") ? porGrupo.direito : porGrupo.gerais;
    g.n++;
    if (i.correta) g.ok++;
  }
  const motivos = new Map<Classificacao, number>();
  for (const i of itens) if (!i.correta) motivos.set(i.classificacao, (motivos.get(i.classificacao) ?? 0) + 1);

  async function classificar(questaoId: string, classificacao: string) {
    setSalvando(questaoId);
    setErro("");
    const res = await fetch(`/api/admin/estudos/simulados/${simulado.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questao_id: questaoId, classificacao }),
    });
    setSalvando(null);
    if (!res.ok) {
      setErro("Não foi possível salvar o motivo");
      return;
    }
    setItens((xs) => xs.map((x) => (x.questao_id === questaoId ? { ...x, classificacao: classificacao as Classificacao } : x)));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi rotulo="Nota" valor={`${pct}%`} detalhe={`${acertos} de ${total} certas`} tom={tomPorPct(pct)} />
        <Kpi rotulo="Tempo total" valor={formatarDuracao(duracao)} detalhe={`referência ${formatarDuracao(total * SEG_POR_QUESTAO)}`} tom={duracao <= total * SEG_POR_QUESTAO ? "ok" : "warn"} />
        <Kpi rotulo="Tempo médio por questão" valor={formatarTempo(total ? Math.round(duracao / total) : 0)} detalhe={`${lentas} acima de 3 min`} tom={lentas ? "warn" : "ok"} />
        <Kpi rotulo="Em branco · acerto incerto" valor={`${brancas} · ${incertos}`} detalhe="chute e dúvida voltam na Revisão" tom={brancas || incertos ? "warn" : "ok"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitulo>Por matéria</CardTitulo>
          {porGrupo.direito.n > 0 && porGrupo.gerais.n > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
              {(["direito", "gerais"] as const).map((g) => (
                <div key={g} className="rounded-xl border border-e-line px-3 py-2">
                  <span className="text-e-dim">{g === "direito" ? "Direito" : "Gerais"}</span>{" "}
                  <span className="tabular-nums text-e-ink">
                    {porGrupo[g].ok}/{porGrupo[g].n} · {Math.round((porGrupo[g].ok / porGrupo[g].n) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
          <ul className="space-y-2.5">
            {[...porMateria.entries()].map(([m, l]) => {
              const p = Math.round((l.ok / l.n) * 100);
              return (
                <li key={m} className="text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-e-ink">{m}</span>
                    <span className="tabular-nums text-e-dim">
                      {l.ok}/{l.n} · {formatarTempo(Math.round(l.tempo / l.n))} por questão
                    </span>
                  </div>
                  <div className="mt-1 flex">
                    <Barra pct={p} tom={tomPorPct(p)} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <CardTitulo>Motivo dos erros</CardTitulo>
          {motivos.size ? (
            <ul className="space-y-1.5 text-sm">
              {[...motivos.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([k, n]) => (
                  <li key={k} className="flex justify-between">
                    <span className="text-e-ink">{CLASSIFICACAO_LABEL[k]}</span>
                    <span className="tabular-nums text-e-dim">{n}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-e-ok">Nenhum erro. 🎉</p>
          )}
          <p className="mt-3 text-xs text-e-dim">
            O motivo vem como &quot;Não conhecia o assunto&quot; (ou &quot;Tempo ou prioridade&quot;, se ficou em branco). Ajuste em cada questão abaixo: é isso que alimenta o Laboratório de erros.
          </p>
        </Card>
      </div>

      <Card>
        <CardTitulo acao={<Link href="/admin/estudos/simulados" className={BOTAO_SECUNDARIO}>Voltar aos simulados</Link>}>Questão por questão</CardTitulo>
        {erro && <p className="mb-2 text-sm text-e-bad">{erro}</p>}
        <ol className="divide-y divide-e-line">
          {itens.map((it, n) => {
            const q = qPorId.get(it.questao_id);
            if (!q) return null;
            const opcoes = it.correta ? TIPOS_ACERTO : TIPOS_ERRO;
            return (
              <li key={it.questao_id} className="py-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium tabular-nums ${
                      it.correta ? "bg-e-ok-soft text-e-ok" : "bg-e-bad-soft text-e-bad"
                    }`}
                  >
                    {n + 1}
                  </span>
                  <button type="button" onClick={() => setAberta(aberta === q.id ? null : q.id)} className="min-w-0 flex-1 text-left text-sm">
                    <span className="text-e-ink">{q.tema}</span>
                    <span className="block text-xs text-e-dim">
                      {q.materia} · marcou {it.alternativa === null ? "nada" : LETRAS[it.alternativa]} · gabarito {LETRAS[q.c]}
                    </span>
                  </button>
                  <span className={`text-xs tabular-nums ${it.tempo_seg > SEG_POR_QUESTAO ? "text-e-warn" : "text-e-dim"}`}>{formatarTempo(it.tempo_seg)}</span>
                  <label className="w-full sm:w-56">
                    <span className="sr-only">{it.correta ? "Como acertou" : "Por que errou"}</span>
                    <select
                      className={`${CAMPO} mt-0`}
                      value={it.classificacao}
                      disabled={salvando === q.id}
                      onChange={(e) => classificar(q.id, e.target.value)}
                    >
                      {opcoes.map((o) => (
                        <option key={o.k} value={o.k}>
                          {o.t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {aberta === q.id && (
                  <div className="mt-3 space-y-2 rounded-xl border border-e-line bg-e-card-2 p-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">{q.ref}</p>
                    <div className="text-sm leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: htmlSeguro(q.enun) }} />
                    {q.itens && (
                      <ol className="space-y-1 text-sm text-e-ink">
                        {q.itens.map((x, i) => (
                          <li key={i} dangerouslySetInnerHTML={{ __html: htmlSeguro(x) }} />
                        ))}
                      </ol>
                    )}
                    <ul className="space-y-1.5">
                      {q.alts.map((a, i) => (
                        <li
                          key={i}
                          className={`rounded-lg border p-2 text-sm ${
                            i === q.c ? "border-e-ok/60 bg-e-ok-soft" : i === it.alternativa ? "border-e-bad/60 bg-e-bad-soft" : "border-e-line"
                          }`}
                        >
                          <span className="font-medium text-e-dim">{LETRAS[i]}) </span>
                          <span className="text-e-ink" dangerouslySetInnerHTML={{ __html: htmlSeguro(a) }} />
                          <span className={`mt-1 block text-xs ${i === q.c ? "text-e-ok" : "text-e-dim"}`} dangerouslySetInnerHTML={{ __html: htmlSeguro(q.why[i]) }} />
                        </li>
                      ))}
                    </ul>
                    <div className="fonte-lei text-sm leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: fonteHtml(q.fonte) }} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}

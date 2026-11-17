"use client";

import { useMemo, useState } from "react";
import { Eye, Save } from "lucide-react";
import { estimarLinhas, notaDiscursiva, type CasoDiscursiva, type TextoDiscursiva } from "@/lib/estudos-redacao";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, Card, CardTitulo } from "@/components/estudos/ui";

const NIVEIS: { v: 0 | 1 | 2; rotulo: string; cor: string }[] = [
  { v: 2, rotulo: "Abordei", cor: "border-e-ok text-e-ok" },
  { v: 1, rotulo: "Em parte", cor: "border-e-warn text-e-warn" },
  { v: 0, rotulo: "Não abordei", cor: "border-e-bad text-e-bad" },
];

export function DiscursivaClient({ caso, salvo }: { caso: CasoDiscursiva; salvo: TextoDiscursiva | null }) {
  const [texto, setTexto] = useState(salvo?.texto ?? "");
  const [pontos, setPontos] = useState<Record<string, 0 | 1 | 2>>(salvo?.pontos ?? {});
  const [ver, setVer] = useState(Object.keys(salvo?.pontos ?? {}).length > 0);
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);
  const linhas = useMemo(() => estimarLinhas(texto), [texto]);
  const { nota, max } = notaDiscursiva(caso, pontos);
  const min = caso.linhas_min ?? 0;
  const foraDaFaixa = linhas > caso.linhas || (min > 0 && linhas > 0 && linhas < min);
  const nota100 = max > 0 ? Math.round((nota / max) * 100) : 0;
  const marcouTudo = caso.espelho.every((_, i) => pontos[String(i)] !== undefined);

  async function salvar() {
    setSalvando(true);
    setMsg("");
    const res = await fetch("/api/admin/estudos/redacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "discursiva", id: caso.id, texto, pontos }),
    });
    setSalvando(false);
    setMsg(res.ok ? "Salvo." : "Não foi possível salvar.");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card destaque>
        <CardTitulo>Caso</CardTitulo>
        <p className="font-serif text-[15px] leading-relaxed text-e-ink">{caso.enunciado}</p>
        <ol className="mt-3 list-[lower-alpha] pl-5 text-sm text-e-ink">{caso.perguntas.map((q) => <li key={q}>{q}</li>)}</ol>
        <p className="mt-3 text-xs text-e-dim">
          Padrão FCC: texto corrido, {min > 0 ? `${min} a ${caso.linhas}` : `até ${caso.linhas}`} linhas, nota de 0 a 100 (mínimo 60). Abordagem tangencial ou parcial perde pontos; fugir do tema zera.
          Antes de escrever: liste de cabeça os artigos que resolvem o caso.
        </p>
      </Card>

      <Card>
        <CardTitulo acao={<span className={`text-xs ${foraDaFaixa ? "text-e-warn" : "text-e-dim"}`}>≈ {linhas} linhas {min > 0 ? `(${min} a ${caso.linhas})` : `de ${caso.linhas}`}</span>}>Resposta</CardTitulo>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={14}
          className={`${CAMPO} font-serif text-[15px] leading-relaxed`}
          placeholder="Responda cada pergunta, citando o dispositivo (ex.: art. 54 da Lei 9.784/1999)."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setVer(true)} disabled={!texto.trim()} className={BOTAO_SECUNDARIO}>
            <Eye size={13} aria-hidden="true" /> Ver o espelho
          </button>
          <button type="button" onClick={salvar} disabled={salvando} className={BOTAO_SECUNDARIO}>
            <Save size={13} aria-hidden="true" /> Salvar
          </button>
          {msg && <span className="self-center text-xs text-e-dim">{msg}</span>}
        </div>
      </Card>

      {ver && (
        <Card>
          <CardTitulo acao={<span className={`text-sm font-medium ${marcouTudo ? (nota100 >= 60 ? "text-e-ok" : "text-e-bad") : "text-e-ink"}`}>{nota100}/100{marcouTudo ? (nota100 >= 60 ? " · acima do mínimo" : " · abaixo de 60") : ""}</span>}>Espelho: marque o que você abordou</CardTitulo>
          <ul className="flex flex-col gap-3">
            {caso.espelho.map((e, i) => (
              <li key={i} className="rounded-xl border border-e-line bg-e-card-2 p-3">
                <p className="text-sm text-e-ink">{e.ponto}</p>
                <p className="mt-1 text-xs text-e-dim">
                  {e.fundamento} · peso {e.peso}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {NIVEIS.map((n) => (
                    <button
                      key={n.v}
                      type="button"
                      onClick={() => setPontos({ ...pontos, [String(i)]: n.v })}
                      className={`${BOTAO_SECUNDARIO} ${pontos[String(i)] === n.v ? n.cor : ""}`}
                    >
                      {n.rotulo}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-e-ink">
            <span className="text-e-dim">Dica:</span> {caso.dica}
          </p>
          {caso.tangencia && (
            <p className="mt-2 text-sm text-e-ink">
              <span className="text-e-warn">Tangenciar seria:</span> {caso.tangencia}
            </p>
          )}
          <p className="mt-2 text-xs text-e-dim">Revisão ativa: reescreva em 3 linhas só o ponto que você não abordou, sem olhar o espelho.</p>
          <button type="button" onClick={salvar} disabled={salvando} className={`mt-3 ${BOTAO_PRIMARIO}`}>
            Salvar autocorreção
          </button>
        </Card>
      )}
    </div>
  );
}

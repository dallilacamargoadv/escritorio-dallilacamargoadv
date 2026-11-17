"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpenText, Brain, CheckCircle2 } from "lucide-react";
import type { CorrecaoTrilha, DiaConcluido, ItemAberto } from "@/lib/estudos-trilhas";
import { Sparkle } from "@/components/estudos/Sparkle";
import { Barra, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, Card, CardTitulo, Kpi } from "@/components/estudos/ui";

interface Props {
  trilha: string;
  dia: number;
  trecho: string;
  linkLeitura: string;
  itens: ItemAberto[];
  respondidos: Record<string, boolean>;
  concluido: DiaConcluido | null;
  metodo: { nome: string; como: string };
  linkQuestoes: string;
  linkProximo: string;
}

async function post(body: object) {
  const res = await fetch("/api/admin/estudos/trilhas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Erro");
  return json;
}

export function TrilhaClient(p: Props) {
  const router = useRouter();
  const [resp, setResp] = useState<Record<string, boolean>>(p.respondidos);
  const pendentes = p.itens.filter((i) => !(i.id in p.respondidos));
  const [fila] = useState(pendentes);
  const [i, setI] = useState(0);
  const [correcao, setCorrecao] = useState<CorrecaoTrilha | null>(null);
  const [escolha, setEscolha] = useState("");
  const [leu, setLeu] = useState(pendentes.length < p.itens.length);
  const [blurt, setBlurt] = useState(p.concluido?.blurt ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const feitos = Object.keys(resp).length;
  const acertos = Object.values(resp).filter(Boolean).length;
  const atual = fila[i];
  const fimBloco = i >= fila.length;

  async function responder(r: "certo" | "errado") {
    if (!atual || correcao || salvando) return;
    setEscolha(r);
    setSalvando(true);
    setErro("");
    try {
      const { correcao: c } = await post({ acao: "responder", id: atual.id, resposta: r });
      setCorrecao(c);
      setResp((x) => ({ ...x, [atual.id]: c.ok }));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar");
      setEscolha("");
    } finally {
      setSalvando(false);
    }
  }

  async function acao(nome: "concluir" | "reabrir") {
    setSalvando(true);
    setErro("");
    try {
      await post({ acao: nome, trilha: p.trilha, dia: p.dia, blurt });
      router.refresh();
      if (nome === "reabrir") window.location.reload();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar");
    } finally {
      setSalvando(false);
    }
  }

  const cor = (v: "certo" | "errado") => {
    if (!correcao) return `${BOTAO_SECUNDARIO} text-sm`;
    const certa = correcao.ok ? v === escolha : v !== escolha;
    if (certa) return `${BOTAO_SECUNDARIO} text-sm border-e-ok text-e-ok`;
    return `${BOTAO_SECUNDARIO} text-sm ${v === escolha ? "border-e-bad text-e-bad" : "opacity-60"}`;
  };

  if (p.concluido) {
    return (
      <Card destaque>
        <p className="flex items-center gap-2 text-sm text-e-ink">
          <Sparkle size={16} variante="brilhante" /> Dia concluído em {p.concluido.data.split("-").reverse().join("/")}: {p.concluido.acertos} de {p.concluido.total} no certo ou errado.
        </p>
        {p.concluido.blurt && (
          <>
            <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-e-dim">O que você lembrou (blurting)</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-e-ink">{p.concluido.blurt}</p>
          </>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {p.linkProximo && (
            <Link href={p.linkProximo} className={BOTAO_PRIMARIO}>
              Próximo dia
            </Link>
          )}
          <button type="button" onClick={() => acao("reabrir")} disabled={salvando} className={BOTAO_SECUNDARIO}>
            Refazer este dia
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Kpi rotulo="1. Leitura" valor={leu ? "Feita" : "Falta"} tom={leu ? "ok" : "warn"} />
        <Kpi rotulo="2. Certo ou errado" valor={`${feitos}/${p.itens.length}`} detalhe={`${acertos} acertos`} />
        <Kpi rotulo="3. Revisão ativa" valor={blurt.trim() ? "Escrita" : "Falta"} tom={blurt.trim() ? "ok" : "warn"} />
      </div>

      <Card>
        <CardTitulo acao={<BookOpenText size={16} aria-hidden="true" />}>1. Leia {p.trecho}</CardTitulo>
        <p className="text-sm text-e-dim">
          Leia o texto seco na Biblioteca (abre no primeiro artigo do dia). Grife o que for prazo, competência e exceção: é isso que a FCC troca.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={p.linkLeitura} target="_blank" className={BOTAO_SECUNDARIO}>
            Abrir a lei na Biblioteca
          </Link>
          <button type="button" onClick={() => setLeu(true)} className={`${BOTAO_SECUNDARIO} ${leu ? "border-e-ok text-e-ok" : ""}`}>
            <CheckCircle2 size={13} aria-hidden="true" /> Já li
          </button>
        </div>
      </Card>

      {leu && (
        <Card>
          <CardTitulo acao={<span className="text-xs text-e-dim">{Math.min(i + 1, fila.length)} de {fila.length} restantes</span>}>
            2. Certo ou errado? (o texto pode ter troca de palavra)
          </CardTitulo>
          <div className="mb-3">
            <Barra pct={(feitos / Math.max(1, p.itens.length)) * 100} />
          </div>
          {fimBloco ? (
            <p className="text-sm text-e-ink">
              Bloco fechado: {acertos} de {feitos}.{" "}
              {p.linkQuestoes && (
                <Link href={p.linkQuestoes} className="underline">
                  Quer mais? Questões FCC da matéria no banco.
                </Link>
              )}
            </p>
          ) : (
            atual && (
              <>
                <p className="mb-2 text-xs text-e-dim">{atual.ref}</p>
                {atual.contexto && <p className="mb-2 text-xs italic text-e-dim">{atual.contexto}</p>}
                <p className="font-serif text-[15px] leading-relaxed text-e-ink">{atual.texto}</p>
                <div className="mt-4 flex gap-2">
                  {(["certo", "errado"] as const).map((v) => (
                    <button key={v} type="button" disabled={!!correcao || salvando} onClick={() => responder(v)} className={cor(v)}>
                      {v === "certo" ? "Certo" : "Errado"}
                    </button>
                  ))}
                </div>
                {correcao && (
                  <div className="mt-4 rounded-xl border border-e-line bg-e-card-2 p-3">
                    <p className={`text-sm font-medium ${correcao.ok ? "text-e-ok" : "text-e-bad"}`}>
                      {correcao.ok ? "Acertou." : "Errou."} {correcao.explicacao}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-e-dim">Texto literal</p>
                    <p className="mt-1 font-serif text-sm leading-relaxed text-e-ink">{correcao.literal}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCorrecao(null);
                        setEscolha("");
                        setI((n) => n + 1);
                      }}
                      className={`mt-3 ${BOTAO_PRIMARIO}`}
                    >
                      Próximo
                    </button>
                  </div>
                )}
              </>
            )
          )}
        </Card>
      )}

      {leu && fimBloco && (
        <Card>
          <CardTitulo acao={<Brain size={16} aria-hidden="true" />}>3. Revisão ativa: blurting</CardTitulo>
          <p className="text-sm text-e-dim">
            Sem olhar a lei, escreva tudo o que lembra do trecho de hoje: prazos, quem é competente, exceções. Depois confira na Biblioteca e complete com outra cor de caneta (no papel) ou aqui embaixo.
          </p>
          <p className="mt-2 text-xs text-e-dim">
            <span className="font-medium text-e-ink">Extra de hoje, {p.metodo.nome}:</span> {p.metodo.como}
          </p>
          <textarea value={blurt} onChange={(e) => setBlurt(e.target.value)} rows={7} className={CAMPO} placeholder="O que eu lembro..." />
          <button type="button" onClick={() => acao("concluir")} disabled={salvando || !blurt.trim()} className={`mt-3 ${BOTAO_PRIMARIO}`}>
            Concluir o dia
          </button>
          <p className="mt-2 text-[11px] text-e-dim">Para treinar de novo os que errou, use &ldquo;Refazer este dia&rdquo; depois de concluir.</p>
        </Card>
      )}
      {erro && <p className="text-xs text-e-bad">{erro}</p>}
    </div>
  );
}

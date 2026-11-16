"use client";

import { useMemo, useState } from "react";
import { Eye, Save, Scissors, ShieldAlert } from "lucide-react";
import {
  checarTangenciamento,
  CRITERIOS,
  estimarLinhas,
  LINHAS_MAX,
  LINHAS_MIN,
  nucleosLivres,
  notaGrade,
  RECORTE_VAZIO,
  type Checagem,
  type Grade,
  type Recorte,
  type TemaRedacao,
  type TextoRedacao,
} from "@/lib/estudos-redacao";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, Card, CardTitulo } from "@/components/estudos/ui";

interface Props {
  id: string;
  tema: TemaRedacao | null;
  salvo: TextoRedacao | null;
}

const CAMPOS: { k: keyof Recorte; rotulo: string; dica: string }[] = [
  { k: "eixo", rotulo: "Eixo (círculo de fora)", dica: "A grande área: meio ambiente, tecnologia, saúde..." },
  { k: "assunto", rotulo: "Assunto (meio)", dica: "O recorte dentro do eixo" },
  { k: "tema", rotulo: "Tema (centro)", dica: "O que a banca pediu de fato" },
  { k: "palavra", rotulo: "Palavra de comando", dica: "desafios, importância, efeitos, obstáculos, riscos..." },
];

export function RedacaoClient({ id, tema, salvo }: Props) {
  const [recorte, setRecorte] = useState<Recorte>(salvo?.recorte ?? RECORTE_VAZIO);
  const [conferido, setConferido] = useState(!!salvo?.recorte?.tema && !!tema);
  const [verComentado, setVerComentado] = useState(false);
  const [texto, setTexto] = useState(salvo?.texto ?? "");
  const [grade, setGrade] = useState<Grade>(salvo?.grade ?? { conteudo: 0, estrutura: 0, expressao: 0 });
  const [checagem, setChecagem] = useState<Checagem | null>(null);
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  const linhas = useMemo(() => estimarLinhas(texto), [texto]);
  const tomLinhas = linhas < LINHAS_MIN || linhas > LINHAS_MAX ? "text-e-warn" : "text-e-ok";

  function checar() {
    if (tema) setChecagem(checarTangenciamento(texto, tema.nucleos, tema.comandoSinonimos, tema.armadilhas));
    else {
      const { nucleos, comando } = nucleosLivres(recorte);
      setChecagem(checarTangenciamento(texto, nucleos, comando));
    }
  }

  async function salvar(comGrade: boolean) {
    setSalvando(true);
    setMsg("");
    const res = await fetch("/api/admin/estudos/redacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "redacao", id, recorte, texto, grade: comGrade ? grade : salvo?.grade ?? null }),
    });
    setSalvando(false);
    setMsg(res.ok ? "Salvo." : "Não foi possível salvar.");
  }

  return (
    <div className="flex flex-col gap-4">
      {tema && (
        <Card>
          <CardTitulo>Coletânea (provocações para ativar ideias)</CardTitulo>
          <div className="grid gap-3 md:grid-cols-2">
            {tema.coletanea.map((c) => (
              <div key={c.titulo} className="rounded-xl border border-e-line bg-e-card-2 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-e-dim">{c.titulo}</p>
                <p className="mt-1 text-sm text-e-ink">{c.texto}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-e-dim">Não copie nem parafraseie a coletânea: ela só acorda as ideias, e pode induzir ao tangenciamento.</p>
          <p className="mt-3 font-serif text-[15px] text-e-ink">
            <span className="text-e-dim">Proposta:</span> redija um texto dissertativo-argumentativo sobre &ldquo;{tema.tema}&rdquo;.
          </p>
        </Card>
      )}

      <Card destaque>
        <CardTitulo acao={<Scissors size={16} aria-hidden="true" />}>1. Recorte antes de escrever</CardTitulo>
        <div className="grid gap-3 md:grid-cols-2">
          {CAMPOS.map((c) => (
            <label key={c.k} className="text-xs text-e-dim">
              {c.rotulo}
              {c.k === "tema" ? (
                <textarea
                  rows={2}
                  value={recorte[c.k]}
                  onChange={(e) => setRecorte({ ...recorte, [c.k]: e.target.value })}
                  placeholder={tema ? "Com suas palavras: o que exatamente ela pediu?" : "Cole o tema aqui"}
                  className={CAMPO}
                />
              ) : (
                <input value={recorte[c.k]} onChange={(e) => setRecorte({ ...recorte, [c.k]: e.target.value })} placeholder={c.dica} className={CAMPO} />
              )}
            </label>
          ))}
        </div>
        {tema && (
          <button type="button" onClick={() => setConferido(true)} className={`mt-3 ${BOTAO_SECUNDARIO}`}>
            Conferir meu recorte
          </button>
        )}
        {tema && conferido && (
          <div className="mt-3 grid gap-3 rounded-xl border border-e-line bg-e-card-2 p-3 text-sm md:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-e-dim">Eixo → assunto → tema</p>
              <p className="text-e-ink">
                {tema.eixo} → {tema.assunto} → <span className="font-medium">{tema.tema}</span>
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-e-dim">Palavra de comando</p>
              <p className="text-e-ink">{tema.comando}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-e-ok">O que fazer</p>
              <ul className="list-disc pl-4 text-e-ink">{tema.recorte.fazer.map((f) => <li key={f}>{f}</li>)}</ul>
              <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-e-bad">O que é tangenciar</p>
              <ul className="list-disc pl-4 text-e-ink">{tema.recorte.tangenciar.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
          </div>
        )}
      </Card>

      {tema && conferido && (
        <Card>
          <CardTitulo
            acao={
              <button type="button" onClick={() => setVerComentado(!verComentado)} className={BOTAO_SECUNDARIO}>
                <Eye size={13} aria-hidden="true" /> {verComentado ? "Esconder" : "Mostrar"}
              </button>
            }
          >
            Tema comentado: tese, argumentos e repertórios
          </CardTitulo>
          {!verComentado ? (
            <p className="text-sm text-e-dim">Tente montar sua tese e seus 2 argumentos primeiro. Depois abra e compare: é aí que fixa.</p>
          ) : (
            <div className="flex flex-col gap-3 text-sm">
              <p className="text-e-ink">
                <span className="text-e-dim">Tese possível:</span> {tema.tese}
              </p>
              {tema.argumentos.map((a) => (
                <p key={a.titulo} className="text-e-ink">
                  <span className="font-medium">{a.titulo}.</span> {a.texto}
                </p>
              ))}
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-e-dim">Repertórios</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {tema.repertorios.map((r) => (
                    <li key={r.nome} className="text-e-ink">
                      <span className="rounded bg-e-accent-soft px-1.5 py-0.5 text-[10px] uppercase text-e-dim">{r.tipo}</span> <span className="font-medium">{r.nome}</span>: {r.uso}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-e-ink">
                <span className="text-e-dim">Conclusão:</span> {tema.conclusao}
              </p>
            </div>
          )}
        </Card>
      )}

      <Card>
        <CardTitulo acao={<span className={`text-xs ${tomLinhas}`}>≈ {linhas} linhas (meta {LINHAS_MIN} a {LINHAS_MAX})</span>}>2. Folha</CardTitulo>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={18}
          className={`${CAMPO} font-serif text-[15px] leading-relaxed`}
          placeholder="Um parágrafo por linha em branco. Introdução com tese, 2 desenvolvimentos, conclusão."
        />
        <p className="mt-1 text-[11px] text-e-dim">Linhas estimadas com ~75 caracteres por linha. Confira o limite exato no edital.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={checar} disabled={!texto.trim()} className={BOTAO_SECUNDARIO}>
            <ShieldAlert size={13} aria-hidden="true" /> Checar tangenciamento
          </button>
          <button type="button" onClick={() => salvar(false)} disabled={salvando} className={BOTAO_SECUNDARIO}>
            <Save size={13} aria-hidden="true" /> Salvar rascunho
          </button>
          {msg && <span className="self-center text-xs text-e-dim">{msg}</span>}
        </div>
        {checagem && (
          <div className="mt-3 rounded-xl border border-e-line bg-e-card-2 p-3 text-sm">
            <p className="text-[11px] uppercase tracking-[0.12em] text-e-dim">Checagem (estimativa automática, não substitui a correção)</p>
            {checagem.alertas.length === 0 ? (
              <p className="mt-1 text-e-ok">Todos os núcleos do tema e a palavra de comando aparecem, em todos os parágrafos. Bom sinal.</p>
            ) : (
              <ul className="mt-1 list-disc pl-4 text-e-ink">{checagem.alertas.map((a) => <li key={a}>{a}</li>)}</ul>
            )}
            {checagem.porParagrafo.length > 0 && (
              <p className="mt-2 text-xs text-e-dim">
                Núcleos por parágrafo: {checagem.porParagrafo.map((p) => `§${p.n} ${p.nucleos}/${p.total}`).join(" · ")}
              </p>
            )}
          </div>
        )}
      </Card>

      <Card>
        <CardTitulo acao={<span className="text-sm font-medium text-e-ink">{notaGrade(grade)}/100</span>}>3. Autocorreção (nota sempre estimada)</CardTitulo>
        <p className="mb-3 text-xs text-e-dim">Grade no modelo usual da FCC: Conteúdo 40, Estrutura 30, Expressão 30. Leia o texto em voz alta antes de dar a nota.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {CRITERIOS.map((c) => (
            <div key={c.chave}>
              <label className="text-sm text-e-ink">
                {c.nome}: <span className="font-medium">{grade[c.chave]}</span>/{c.max}
                <input
                  type="range"
                  min={0}
                  max={c.max}
                  value={grade[c.chave]}
                  onChange={(e) => setGrade({ ...grade, [c.chave]: Number(e.target.value) })}
                  className="mt-1 w-full accent-[var(--color-e-accent)]"
                />
              </label>
              <ul className="mt-1 list-disc pl-4 text-xs text-e-dim">{c.itens.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => salvar(true)} disabled={salvando || !texto.trim()} className={`mt-4 ${BOTAO_PRIMARIO}`}>
          Salvar texto e nota
        </button>
      </Card>
    </div>
  );
}

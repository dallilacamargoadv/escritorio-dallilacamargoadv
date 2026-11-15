"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Highlighter, Tag, Upload } from "lucide-react";
import { partesGrifadas, type DocResumo, type Trecho } from "@/lib/estudos-biblioteca";
import { createClient } from "@/lib/supabase/client";
import { BOTAO_SECUNDARIO, CAMPO, Card } from "@/components/estudos/ui";

/** Texto com os termos da busca marcados. */
export function Grifado({ texto, ts }: { texto: string; ts: string[] }) {
  return (
    <>
      {partesGrifadas(texto, ts).map((p, i) =>
        p.m ? (
          <mark key={i} className="rounded-sm bg-e-accent-soft px-0.5 text-e-ink">
            {p.s}
          </mark>
        ) : (
          <span key={i}>{p.s}</span>
        ),
      )}
    </>
  );
}

interface Props {
  doc: DocResumo;
  trechos: Trecho[];
  grifos: string[];
  etiquetas: string[];
  temPdf: boolean;
  q: string;
  ts: string[];
  soGrifos: boolean;
  pagina: number;
  paginas: number;
  totalFiltrado: number;
  alvo: string;
  irNaoAchou: boolean;
}

const ancora = (ref: string) => "t-" + ref.replace(/[^\w]+/g, "-");

export function BibliotecaLeitor(p: Props) {
  const router = useRouter();
  const [grifos, setGrifos] = useState(new Set(p.grifos));
  const [etqTexto, setEtqTexto] = useState(p.etiquetas.join(", "));
  const [etiquetas, setEtiquetas] = useState(p.etiquetas);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState("");

  useEffect(() => {
    if (p.alvo) document.getElementById(ancora(p.alvo))?.scrollIntoView({ block: "center" });
  }, [p.alvo]);

  const base = `/admin/estudos/biblioteca/${p.doc.id}`;
  const link = (mud: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (p.q) sp.set("q", p.q);
    if (p.soGrifos) sp.set("grifos", "1");
    for (const [k, v] of Object.entries(mud)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const s = sp.toString();
    return s ? `${base}?${s}` : base;
  };

  async function post(body: object) {
    const res = await fetch("/api/admin/estudos/biblioteca", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc: p.doc.id, ...body }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Erro");
    return json;
  }

  async function grifar(ref: string) {
    setErro("");
    try {
      const { grifado } = await post({ acao: "grifo", ref });
      setGrifos((g) => {
        const n = new Set(g);
        if (grifado) n.add(ref);
        else n.delete(ref);
        return n;
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar");
    }
  }

  async function salvarEtiquetas() {
    setErro("");
    setOcupado("etq");
    try {
      const { etiquetas: novas } = await post({ acao: "etiquetas", etiquetas: etqTexto.split(",") });
      setEtiquetas(novas);
      setEtqTexto(novas.join(", "));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar");
    } finally {
      setOcupado("");
    }
  }

  async function abrirPdf(pag?: number) {
    setErro("");
    const janela = window.open("", "_blank");
    try {
      const res = await fetch(`/api/admin/estudos/biblioteca?doc=${p.doc.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro");
      const url = json.url + (pag ? `#page=${pag}` : "");
      if (janela) janela.location.href = url;
      else window.location.href = url;
    } catch (e) {
      janela?.close();
      setErro(e instanceof Error ? e.message : "Não foi possível abrir");
    }
  }

  async function enviarPdf(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro("");
    if (arquivo.type !== "application/pdf") return setErro("Escolha um arquivo PDF.");
    if (arquivo.size > 20 * 1024 * 1024) return setErro("O PDF passa de 20 MB.");
    setOcupado("pdf");
    try {
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("biblioteca")
        .upload(`${p.doc.id}.pdf`, arquivo, { contentType: "application/pdf", upsert: true });
      if (error) throw error;
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar");
    } finally {
      setOcupado("");
    }
  }

  const unidade = p.doc.unidade === "artigo" ? "artigo" : "página";

  return (
    <div className="flex flex-col gap-4">
      {p.doc.aviso && <p className="rounded-xl border border-e-warn/50 bg-e-card px-3 py-2 text-xs text-e-warn">{p.doc.aviso}</p>}

      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <form action={base} className="flex min-w-60 flex-1 gap-2">
              {p.soGrifos && <input type="hidden" name="grifos" value="1" />}
              <label className="sr-only" htmlFor="q-doc">Buscar nesta obra</label>
              <input id="q-doc" name="q" defaultValue={p.q} placeholder="Buscar nesta obra" className={`${CAMPO} mt-0 flex-1`} />
              <button type="submit" className={BOTAO_SECUNDARIO}>Buscar</button>
            </form>
            <form action={base} className="flex gap-2">
              <label className="sr-only" htmlFor="ir">Ir para {unidade}</label>
              <input id="ir" name="ir" placeholder={unidade === "artigo" ? "Art. nº" : "Pág. nº"} className={`${CAMPO} mt-0 w-24`} />
              <button type="submit" className={BOTAO_SECUNDARIO}>Ir</button>
            </form>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link href={link({ grifos: p.soGrifos ? "" : "1", p: "" })} className={`${BOTAO_SECUNDARIO} ${p.soGrifos ? "border-e-warn text-e-ink" : ""}`}>
              <Highlighter size={13} aria-hidden="true" /> {p.soGrifos ? "Mostrando só grifados" : `Só grifados (${grifos.size})`}
            </Link>
            {p.q && (
              <Link href={link({ q: "", p: "" })} className={BOTAO_SECUNDARIO}>
                Limpar busca
              </Link>
            )}
            {p.doc.pdf &&
              (p.temPdf ? (
                <button type="button" onClick={() => abrirPdf()} className={BOTAO_SECUNDARIO}>
                  <ExternalLink size={13} aria-hidden="true" /> Abrir PDF original
                </button>
              ) : (
                <label className={`${BOTAO_SECUNDARIO} cursor-pointer`}>
                  <Upload size={13} aria-hidden="true" /> {ocupado === "pdf" ? "Enviando…" : `Enviar o PDF (${p.doc.pdf})`}
                  <input type="file" accept="application/pdf" className="sr-only" disabled={!!ocupado} onChange={(e) => enviarPdf(e.target.files?.[0])} />
                </label>
              ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tag size={13} className="text-e-dim" aria-hidden="true" />
            <label className="sr-only" htmlFor="etq">Etiquetas</label>
            <input
              id="etq"
              value={etqTexto}
              onChange={(e) => setEtqTexto(e.target.value)}
              placeholder="Etiquetas separadas por vírgula (ex.: revisar, cai muito)"
              className={`${CAMPO} mt-0 min-w-52 flex-1`}
            />
            <button type="button" onClick={salvarEtiquetas} disabled={ocupado === "etq" || etqTexto === etiquetas.join(", ")} className={`${BOTAO_SECUNDARIO} disabled:opacity-50`}>
              {ocupado === "etq" ? "Salvando…" : "Salvar etiquetas"}
            </button>
          </div>
          {erro && <p role="alert" className="text-xs text-e-bad">{erro}</p>}
          {p.irNaoAchou && <p className="text-xs text-e-warn">Não achei esse {unidade} nesta obra.</p>}
        </div>
      </Card>

      {p.doc.total === 0 ? (
        <Card>
          <p className="text-sm text-e-dim">Este PDF é imagem (sem texto pesquisável). Abra o original pelo botão acima.</p>
        </Card>
      ) : (
        <>
          <p className="text-xs text-e-dim">
            {p.totalFiltrado} {p.totalFiltrado === 1 ? unidade : unidade === "artigo" ? "artigos" : "páginas"}
            {p.q ? ` com “${p.q}”` : ""} · página {p.pagina} de {p.paginas}
          </p>
          <ol className="flex flex-col gap-2">
            {p.trechos.map((t) => {
              const g = grifos.has(t.ref);
              const num = Number(t.ref.replace(/\D/g, ""));
              return (
                <li
                  key={t.ref}
                  id={ancora(t.ref)}
                  className={`rounded-xl border p-3 sm:p-4 ${g ? "border-e-warn/60 bg-e-warn-soft" : "border-e-line bg-e-card"} ${p.alvo === t.ref ? "ring-1 ring-e-accent" : ""}`}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-[0.12em] text-e-dim">{t.ref}</span>
                    <span className="flex gap-1.5">
                      {p.doc.unidade === "página" && p.temPdf && (
                        <button type="button" onClick={() => abrirPdf(num)} className={BOTAO_SECUNDARIO} aria-label={`Abrir o PDF na ${t.ref}`}>
                          <ExternalLink size={12} aria-hidden="true" /> PDF
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => grifar(t.ref)}
                        aria-pressed={g}
                        className={`${BOTAO_SECUNDARIO} ${g ? "border-e-warn text-e-ink" : ""}`}
                      >
                        <Highlighter size={12} aria-hidden="true" /> {g ? "Grifado" : "Grifar"}
                      </button>
                    </span>
                  </div>
                  <p className="whitespace-pre-line font-serif text-[15px] leading-relaxed text-e-ink">
                    <Grifado texto={t.t} ts={p.ts} />
                  </p>
                </li>
              );
            })}
          </ol>
          {p.paginas > 1 && (
            <nav aria-label="Páginas" className="flex items-center justify-between text-xs">
              {p.pagina > 1 ? <Link href={link({ p: String(p.pagina - 1) })} className={BOTAO_SECUNDARIO}>← Anteriores</Link> : <span />}
              <span className="text-e-dim">{p.pagina} / {p.paginas}</span>
              {p.pagina < p.paginas ? <Link href={link({ p: String(p.pagina + 1) })} className={BOTAO_SECUNDARIO}>Próximos →</Link> : <span />}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

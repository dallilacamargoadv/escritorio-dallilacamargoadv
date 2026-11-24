import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getEstadoTrilhas, TRILHAS } from "@/lib/db-estudos-trilhas";
import { rotuloTema, temaAtual, temasFeitos } from "@/lib/estudos-trilhas";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { Barra, Cabecalho, Card, CardTitulo } from "@/components/estudos/ui";

export default async function TrilhasPage() {
  let estado;
  try {
    estado = await getEstadoTrilhas();
  } catch {
    redirect("/login");
  }
  return (
    <>
      <Link href="/admin/estudos/desafios" className="mb-3 inline-flex items-center gap-1 text-xs text-e-dim hover:text-e-ink">
        <ArrowLeft size={13} aria-hidden="true" /> Desafios
      </Link>
      <Cabecalho
        titulo="Lei seca por tema"
        sub="Um tema por vez, na ordem do edital: depois da teoria, leia só os artigos daquele tema, responda o certo ou errado de todos os dispositivos e faça a revisão ativa. Em cada tema: como a FCC cobra e o olhar da procuradoria."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {TRILHAS.map((t) => {
          const atual = temaAtual(t, estado);
          return (
            <Card key={t.id}>
              <CardTitulo acao={<span className="text-xs text-e-dim">{temasFeitos(t, estado)} de {t.temas.length} temas</span>}>
                {MATERIA_POR_ID.get(t.materia_id)?.nome ?? t.materia_id}
              </CardTitulo>
              <div className="mb-3">
                <Barra pct={(temasFeitos(t, estado) / t.temas.length) * 100} tom="accent" />
              </div>
              <ol className="flex flex-col gap-1.5">
                {t.temas.map((x) => {
                  const c = estado.concluidos[x.id];
                  return (
                    <li key={x.id}>
                      <Link
                        href={`/admin/estudos/desafios/trilha/${x.id}`}
                        className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${c ? "border-e-ok bg-e-ok-soft text-e-ok" : atual?.id === x.id ? "border-e-accent text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"}`}
                      >
                        <span className="w-5 shrink-0 text-xs">{c ? <Check size={13} aria-hidden="true" /> : `${x.ordem}.`}</span>
                        <span>
                          {x.nome}
                          <span className="block text-[11px] opacity-80">
                            {rotuloTema(x)} · {x.itens.length} itens{c && c.total > 0 ? ` · ${c.acertos}/${c.total}` : ""}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </Card>
          );
        })}
      </div>
    </>
  );
}

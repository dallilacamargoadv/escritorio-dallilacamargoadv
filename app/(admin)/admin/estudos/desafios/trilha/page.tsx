import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getEstadoTrilhas, TRILHAS } from "@/lib/db-estudos-trilhas";
import { chaveDia, diasFeitos, rotuloTrecho } from "@/lib/estudos-trilhas";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { Barra, Cabecalho, Card, CardTitulo } from "@/components/estudos/ui";

export default async function TrilhasPage() {
  let estado;
  try {
    estado = await getEstadoTrilhas();
  } catch {
    redirect("/login");
  }
  const materias = [...new Set(TRILHAS.map((t) => t.materia_id))];
  return (
    <>
      <Link href="/admin/estudos/desafios" className="mb-3 inline-flex items-center gap-1 text-xs text-e-dim hover:text-e-ink">
        <ArrowLeft size={13} aria-hidden="true" /> Desafios
      </Link>
      <Cabecalho
        titulo="Trilhas de lei seca"
        sub="A lei inteira em dias de leitura. Cada dia: ler o trecho, responder o bloco de certo ou errado e fazer a revisão ativa. A trilha de cada matéria aparece nos Desafios no dia em que ela está no cronograma."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {materias.map((m) => (
          <Card key={m}>
            <CardTitulo>{MATERIA_POR_ID.get(m)?.nome ?? m}</CardTitulo>
            {TRILHAS.filter((t) => t.materia_id === m).map((t) => (
              <div key={t.id} className="mb-4">
                <p className="text-sm font-medium text-e-ink">
                  {t.nome} <span className="text-xs font-normal text-e-dim">· {diasFeitos(t, estado)} de {t.dias.length} dias</span>
                </p>
                <div className="my-1.5">
                  <Barra pct={(diasFeitos(t, estado) / t.dias.length) * 100} tom="accent" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.dias.map((d) => {
                    const c = estado.concluidos[chaveDia(t.id, d.dia)];
                    return (
                      <Link
                        key={d.dia}
                        href={`/admin/estudos/desafios/trilha/${t.id}?dia=${d.dia}`}
                        title={rotuloTrecho(d)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] ${c ? "border-e-ok bg-e-ok-soft text-e-ok" : "border-e-line text-e-dim hover:text-e-ink"}`}
                      >
                        {c && <Check size={11} aria-hidden="true" />}
                        Dia {d.dia}
                        {c && c.total > 0 && ` · ${c.acertos}/${c.total}`}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </>
  );
}

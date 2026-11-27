import Link from "next/link";
import { redirect } from "next/navigation";
import { getRespostas, QUESTAO_POR_ID } from "@/lib/db-estudos";
import { BARALHO_ERROS, cartoesDosErros, mapaDosErros, rotuloMotivo, type NoSubtema } from "@/lib/estudos-erros-cartoes";
import { htmlSeguro } from "@/lib/estudos-html";
import { Cabecalho, Card } from "@/components/estudos/ui";
import { RevisaoDeOntem } from "@/components/estudos/RevisaoDeOntem";
import { todayBelemDateString } from "@/lib/atividades-utils";

const tom = (pendentes: number) => (pendentes ? "bg-e-bad-soft text-e-bad" : "bg-e-ok-soft text-e-ok");
const contagem = (vezes: number, pendentes: number) => `${vezes} ${vezes === 1 ? "erro" : "erros"} · ${pendentes ? `${pendentes} ainda errando` : "superado"}`;

export default async function MapaErrosPage(props: PageProps<"/admin/estudos/mapa-erros">) {
  const sp = await props.searchParams;
  let respostas;
  try {
    respostas = await getRespostas();
  } catch {
    redirect("/login");
  }
  const mapa = mapaDosErros(cartoesDosErros(respostas, QUESTAO_POR_ID));
  const pedida = typeof sp.materia === "string" ? sp.materia : "";
  const m = mapa.find((x) => x.materia_id === pedida) ?? mapa[0];

  return (
    <>
      <Cabecalho
        titulo="Mapa dos erros"
        sub="Seus erros agrupados por matéria, tema e subtema. Abra um subtema para ver as questões, o motivo, a sua nota e a regra, e revise os cartões só dele."
      />
      <RevisaoDeOntem hoje={todayBelemDateString()} respostas={respostas} />
      {!m ? (
        <Card>
          <p className="text-sm text-e-dim">Nenhum erro ainda. Quando você errar uma questão e disser o motivo, ela aparece aqui.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {mapa.map((x) => (
              <Link
                key={x.materia_id}
                href={`/admin/estudos/mapa-erros?materia=${x.materia_id}`}
                className={`rounded-full border px-3 py-1 text-xs transition-colors duration-150 ${x.materia_id === m.materia_id ? "border-e-glow bg-e-glow text-e-bg" : "border-e-line text-e-dim hover:text-e-ink"}`}
              >
                {x.materia} · {x.vezes}
              </Link>
            ))}
          </div>

          <Card>
            <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <div className="self-start rounded-2xl border border-e-accent/50 bg-e-accent-soft p-4 text-center md:sticky md:top-6">
                <p className="text-base text-e-ink">{m.materia}</p>
                <p className="mt-1 text-[11px] tabular-nums text-e-dim">
                  {m.vezes} erros · {m.questoes} {m.questoes === 1 ? "questão" : "questões"}
                </p>
                <p className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] ${tom(m.pendentes)}`}>{m.pendentes ? `${m.pendentes} ainda errando` : "tudo superado"}</p>
              </div>
              <ul className="space-y-4">
                {m.temas.map((t) => (
                  <li key={t.tema} className="border-l-2 border-e-line pl-3">
                    <p className="text-sm text-e-ink">
                      {t.tema} <span className="text-[11px] tabular-nums text-e-dim">· {contagem(t.vezes, t.pendentes)}</span>
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {t.subtemas.map((s) => (
                        <Subtema key={s.chave} s={s} />
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          <p className="text-[11px] text-e-dim">
            <span className="rounded-md bg-e-bad-soft px-1.5 py-0.5 text-e-bad">vermelho</span> a última tentativa ainda foi erro, chute ou dúvida ·{" "}
            <span className="rounded-md bg-e-ok-soft px-1.5 py-0.5 text-e-ok">verde</span> já acertou com firmeza depois do erro
          </p>
        </div>
      )}
    </>
  );
}

function Subtema({ s }: { s: NoSubtema }) {
  const mid = s.erros[0].materia_id;
  return (
    <li>
      <details className="group rounded-xl border border-e-line bg-e-card-2 open:border-e-accent/50">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm text-e-ink">
          <span>{s.temFiltro ? s.nome : "Sem subtema (agrupado pelo tema)"}</span>
          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${tom(s.pendentes)}`}>{contagem(s.vezes, s.pendentes)}</span>
        </summary>
        <div className="space-y-2.5 border-t border-e-line px-3 py-2.5">
          {s.erros.map((e) => (
            <div key={e.questao_id} className="text-xs leading-relaxed text-e-ink">
              <p className="text-[11px] text-e-dim">
                {e.superado ? <span className="text-e-ok">Superado</span> : <span className="text-e-bad">Ainda errando</span>} · {e.ref} · errou {e.vezes} {e.vezes === 1 ? "vez" : "vezes"} ·{" "}
                {e.motivos.map(rotuloMotivo).join(", ")}
              </p>
              {e.pegadinhas[0] && <p className="mt-0.5 border-l-2 border-e-bad/60 pl-2">Você marcou: “{e.pegadinhas[0].marcada}”</p>}
              <p className="mt-0.5 border-l-2 border-e-ok/60 pl-2">O certo: “{e.certa}”</p>
              {e.notas.at(-1) && <p className="mt-0.5 italic text-e-dim">Sua nota: “{e.notas.at(-1)}”</p>}
              <Link href={`/admin/estudos/questoes?materia=${mid}&id=${e.questao_id}`} className="text-e-blue hover:underline">
                Refazer a questão
              </Link>
            </div>
          ))}
          {s.regra && (
            <p className="rounded-xl bg-e-card p-2.5 text-xs leading-relaxed text-e-ink">
              <span className="text-e-dim">Regra para revisar: </span>
              <span dangerouslySetInnerHTML={{ __html: htmlSeguro(s.regra) }} />
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-xs">
            <Link href={`/admin/estudos/flashcards?baralho=${encodeURIComponent(BARALHO_ERROS)}&subtema=${encodeURIComponent(s.chave)}`} className="text-e-blue hover:underline">
              Revisar os cartões deste {s.temFiltro ? "subtema" : "tema"}
            </Link>
            {s.temFiltro && (
              <Link href={`/admin/estudos/questoes?materia=${mid}&subtema=${encodeURIComponent(s.chave)}`} className="text-e-blue hover:underline">
                Treinar as questões
              </Link>
            )}
          </div>
        </div>
      </details>
    </li>
  );
}

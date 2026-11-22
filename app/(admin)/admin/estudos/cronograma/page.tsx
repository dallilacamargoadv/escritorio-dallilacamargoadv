import Link from "next/link";
import { redirect } from "next/navigation";
import { getAtrasados, getCronograma, getEstudoConfig } from "@/lib/db-estudos";
import { addDaysToDateString, todayBelemDateString } from "@/lib/atividades-utils";
import { diaDaSemana, formatarData } from "@/lib/estudos-utils";
import { BlocosDoDia } from "@/components/admin/estudos/BlocosDoDia";
import { linksDosBlocos } from "@/lib/estudos-links";
import { CronogramaConfig } from "@/components/admin/estudos/CronogramaConfig";
import { Cabecalho } from "@/components/estudos/ui";
import { CalendarioSemana } from "@/components/estudos/CalendarioSemana";

function inicioDaSemana(data: string) {
  return addDaysToDateString(data, -diaDaSemana(data));
}

export default async function CronogramaPage(props: PageProps<"/admin/estudos/cronograma">) {
  const sp = await props.searchParams;
  const hoje = todayBelemDateString();
  const pedido = typeof sp.semana === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.semana) ? sp.semana : hoje;
  const inicio = inicioDaSemana(pedido);
  const fim = addDaysToDateString(inicio, 6);
  let dados;
  try {
    dados = await Promise.all([getEstudoConfig(), getCronograma(inicio, fim), getAtrasados(hoje), getCronograma(hoje, addDaysToDateString(hoje, 400))]);
  } catch {
    redirect("/login");
  }
  const [config, itens, atrasados, futuros] = dados;
  const dias = Array.from({ length: 7 }, (_, i) => addDaysToDateString(inicio, i));

  return (
    <div className="space-y-6">
      <Cabecalho titulo="Cronograma" sub="Seus horários viram um plano diário. Marque o que fez e replaneje quando atrasar." />
      <CronogramaConfig config={config} temPlano={futuros.length > 0} />

      <details className="rounded-2xl border border-e-line bg-e-card p-4 text-sm text-e-dim">
        <summary className="cursor-pointer text-e-ink">Como o plano funciona</summary>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>
            <span className="text-e-ink">Segunda a sexta:</span> 2 matérias por dia, em rodízio (as do núcleo da prova aparecem mais).
            Em cada uma: aquecimento com 5 questões antes de estudar, lei seca, teoria só no que você errou e bateria de questões.
          </li>
          <li>
            <span className="text-e-ink">Português todo dia</span>, fora das 2 matérias: teoria curta e muitas questões. E 15 minutos da
            fila da aba Revisão.
          </li>
          <li>
            <span className="text-e-ink">Quarta:</span> uma matéria e um simulado de lei seca de uma matéria que você já estudou.
          </li>
          <li>
            <span className="text-e-ink">Sábado:</span> revisão (fila, laboratório de erros e lei seca grifada) e discursiva.
          </li>
          <li>
            <span className="text-e-ink">Domingo:</span> simuladão cronometrado e correção, classificando cada erro. Para uma prova completa,
            reserve pelo menos 4 horas no domingo.
          </li>
        </ul>
      </details>

      {atrasados.length > 0 && (
        <section className="rounded-2xl border border-e-bad bg-e-card p-4">
          <h2 className="text-[11px] uppercase tracking-[0.14em] text-e-bad">{atrasados.length} blocos ficaram para trás</h2>
          <p className="mt-1 text-sm text-e-dim">
            Marque o que você fez mesmo atrasado. O resto não precisa ser recuperado: use &quot;replanejar&quot; acima e o plano se
            ajusta a partir de hoje.
          </p>
          <div className="mt-3 max-h-72 overflow-y-auto">
            <BlocosDoDia itens={atrasados} links={linksDosBlocos(atrasados)} vazio="" />
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between gap-2">
          <Link href={`/admin/estudos/cronograma?semana=${addDaysToDateString(inicio, -7)}`} className="rounded-full border border-e-line px-3 py-1.5 text-xs text-e-dim hover:text-e-ink">
            Semana anterior
          </Link>
          <p className="text-sm text-e-ink">
            {formatarData(inicio)} a {formatarData(fim)}
          </p>
          <Link href={`/admin/estudos/cronograma?semana=${addDaysToDateString(inicio, 7)}`} className="rounded-full border border-e-line px-3 py-1.5 text-xs text-e-dim hover:text-e-ink">
            Próxima semana
          </Link>
        </div>
        <div className="mt-4">
          <CalendarioSemana
            hoje={hoje}
            itens={itens}
            links={linksDosBlocos(itens)}
            dias={dias.map((d) => ({
              data: d,
              rotulo: formatarData(d, { weekday: "short" }).replace(".", ""),
              numero: formatarData(d, { day: "2-digit", month: "2-digit" }),
            }))}
          />
        </div>
      </section>
    </div>
  );
}

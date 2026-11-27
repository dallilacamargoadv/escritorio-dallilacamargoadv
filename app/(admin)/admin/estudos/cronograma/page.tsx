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
            <span className="text-e-ink">Todo dia, até a prova:</span> revisão espaçada com teto (até 10 questões, 8 artigos e 20 cartões; o resto entra nos dias seguintes). Assunto que você já estudou não volta como teoria: vai para revisão e questões.
          </li>
          <li>
            <span className="text-e-ink">Segunda a sexta:</span> 2 matérias de Direito por dia, em rodízio (as do núcleo aparecem mais).
            Em cada uma: aquecimento com 5 questões, lei seca do tema (leitura e certo/errado), teoria só no que você errou e bateria de questões.
          </li>
          <li>
            <span className="text-e-ink">Português todo dia</span> (segunda, quarta e sexta: próxima aula da professora Adriana; nos outros dias, questões do mesmo assunto) e <span className="text-e-ink">Matemática ou Informática todo dia</span>, alternando.
          </li>
          <li>
            <span className="text-e-ink">Quarta:</span> uma matéria e um simulado de lei seca de uma matéria que você já estudou.
          </li>
          <li>
            <span className="text-e-ink">Sábado:</span> 1 hora de revisão do que ficou para trás (erros das matérias já estudadas), simuladão de 2h30 com 3 minutos por questão, correção, uma matéria e um tema do Maranhão.
          </li>
          <li>
            <span className="text-e-ink">Domingo:</span> caderno de erros da semana (site, simuladão e TEC), lei seca desses erros, discursiva com análise, uma matéria e o fechamento da semana.
          </li>
        </ul>
      </details>

      {atrasados.length > 0 && (
        <details className="rounded-2xl border border-e-line bg-e-card p-4">
          <summary className="cursor-pointer text-sm text-e-dim">{atrasados.length} blocos de dias anteriores sem marcação</summary>
          <p className="mt-2 text-sm text-e-dim">Se fez, marque. Se não fez, deixe: não acumula e não precisa recuperar.</p>
          <div className="mt-3 max-h-72 overflow-y-auto">
            <BlocosDoDia itens={atrasados} links={linksDosBlocos(atrasados)} vazio="" />
          </div>
        </details>
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

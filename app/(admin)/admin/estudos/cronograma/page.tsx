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
            <span className="text-e-ink">Segunda a sexta, no máximo 3 matérias:</span> Português da professora Adriana + 2 matérias de Direito.
            Em cada matéria: aquecimento, lei seca do tema, a aula da vez no caderno e questões. Assunto já estudado não volta como teoria.
          </li>
          <li>
            <span className="text-e-ink">Quarta é dia da Matemática</span> (1 hora) e do simulado de lei seca. <span className="text-e-ink">Terça e quinta:</span> subjetiva curta de 20 minutos.
          </li>
          <li>
            <span className="text-e-ink">Sábado (dia inteiro):</span> revisão do que ficou para trás, simuladão de 2h30, correção, uma matéria, Informática e História ou Geografia do MA.
          </li>
          <li>
            <span className="text-e-ink">Domingo (dia inteiro):</span> caderno de erros da semana, lei seca dos erros, discursiva com análise, uma matéria, Matemática e o fechamento da semana.
          </li>
          <li>
            <span className="text-e-ink">Dia de revisão:</span> só o que você já estudou, com lei seca, certo/errado, questões e cartões, sem matéria nova.
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

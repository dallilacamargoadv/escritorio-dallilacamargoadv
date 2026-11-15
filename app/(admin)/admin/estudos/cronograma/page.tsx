import Link from "next/link";
import { redirect } from "next/navigation";
import { getAtrasados, getCronograma, getEstudoConfig } from "@/lib/db-estudos";
import { addDaysToDateString, todayBelemDateString } from "@/lib/atividades-utils";
import { diaDaSemana, formatarData } from "@/lib/estudos-utils";
import { BlocosDoDia } from "@/components/admin/estudos/BlocosDoDia";
import { CronogramaConfig } from "@/components/admin/estudos/CronogramaConfig";
import { Cabecalho } from "@/components/estudos/ui";

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

      {atrasados.length > 0 && (
        <section className="rounded-2xl border border-e-bad bg-e-card p-4">
          <h2 className="text-[11px] uppercase tracking-[0.14em] text-e-bad">{atrasados.length} blocos ficaram para trás</h2>
          <p className="mt-1 text-sm text-e-dim">
            Marque o que você fez mesmo atrasado. O resto não precisa ser recuperado: use &quot;replanejar&quot; acima e o plano se
            ajusta a partir de hoje.
          </p>
          <div className="mt-3 max-h-72 overflow-y-auto">
            <BlocosDoDia itens={atrasados} vazio="" />
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
        <div className="mt-4 space-y-4">
          {dias.map((d) => {
            const doDia = itens.filter((i) => i.data === d);
            return (
              <div key={d} className={`rounded-2xl border bg-e-card p-4 ${d === hoje ? "border-e-accent" : "border-e-line"}`}>
                <h3 className="text-[11px] uppercase tracking-[0.14em] text-e-dim">
                  {formatarData(d, { weekday: "long", day: "2-digit", month: "2-digit" })}
                  {d === hoje ? " · hoje" : ""}
                </h3>
                <div className="mt-2">
                  <BlocosDoDia itens={doDia} vazio="Dia livre." />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

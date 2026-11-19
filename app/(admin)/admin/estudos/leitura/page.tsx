import Link from "next/link";
import { redirect } from "next/navigation";
import { getCronograma } from "@/lib/db-estudos";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { LEITURA, leituraDoDia, TIPO_LEITURA_LABEL, type ItemLeitura, type TipoLeitura } from "@/lib/estudos-leitura";
import { BlocoView } from "@/components/estudos/CadernoBlocos";
import { Cabecalho, CAMPO } from "@/components/estudos/ui";

type Aba = "hoje" | TipoLeitura;
const ABAS: Aba[] = ["hoje", "juris", "lei", "macete", "vf"];

export default async function LeituraPage(props: PageProps<"/admin/estudos/leitura">) {
  const sp = await props.searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const aba: Aba = (ABAS as string[]).includes(s("aba")) ? (s("aba") as Aba) : "hoje";
  const materia = s("materia");
  const hoje = todayBelemDateString();
  let itensHoje;
  try {
    itensHoje = await getCronograma(hoje, hoje);
  } catch {
    redirect("/login");
  }
  const materiasHoje = [...new Set(itensHoje.map((i) => i.materia_id).filter((m): m is string => !!m))];

  const materias = [...new Map(LEITURA.map((x) => [x.materia_id, x.materia])).entries()];
  const lista =
    aba === "hoje" ? leituraDoDia(hoje, materiasHoje) : LEITURA.filter((x) => x.tipo === aba && (!materia || x.materia_id === materia));
  const conta = (t: TipoLeitura) => LEITURA.filter((x) => x.tipo === t && (!materia || x.materia_id === materia)).length;
  const href = (a: Aba) => `/admin/estudos/leitura?aba=${a}${materia && a !== "hoje" ? `&materia=${materia}` : ""}`;

  return (
    <>
      <Cabecalho titulo="Leitura diária" sub="Jurisprudência, lei seca, macetes e certo ou errado dos cadernos, num lugar só, para ler sempre." />

      <nav aria-label="Abas da leitura" className="mb-4 flex flex-wrap items-center gap-2">
        {ABAS.map((a) => (
          <Link
            key={a}
            href={href(a)}
            aria-current={aba === a ? "page" : undefined}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${aba === a ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"}`}
          >
            {a === "hoje" ? "Leitura de hoje" : `${TIPO_LEITURA_LABEL[a]} (${conta(a)})`}
          </Link>
        ))}
        {aba !== "hoje" && (
          <form action="/admin/estudos/leitura" className="ml-auto flex items-center gap-2">
            <input type="hidden" name="aba" value={aba} />
            <label htmlFor="materia" className="sr-only">Matéria</label>
            <select id="materia" name="materia" defaultValue={materia} className={`${CAMPO} mt-0`}>
              <option value="">Todas as matérias</option>
              {materias.map(([id, nome]) => (
                <option key={id} value={id}>{nome}</option>
              ))}
            </select>
            <button type="submit" className="rounded-full border border-e-line px-3 py-1.5 text-sm text-e-dim hover:text-e-ink">Filtrar</button>
          </form>
        )}
      </nav>

      {aba === "hoje" && (
        <p className="mb-4 text-sm text-e-dim">
          {lista.length} itens escolhidos para hoje{materiasHoje.length ? ", começando pelas matérias do cronograma do dia" : ""}. Amanhã a seleção muda.
        </p>
      )}

      <div className="space-y-4">
        {lista.map((x) => (
          <Item key={x.chave} x={x} mostrarTipo={aba === "hoje"} />
        ))}
        {lista.length === 0 && <p className="text-sm text-e-dim">Nada desta matéria por aqui ainda. Os itens entram quando a aula do caderno fica pronta.</p>}
      </div>
    </>
  );
}

function Item({ x, mostrarTipo }: { x: ItemLeitura; mostrarTipo: boolean }) {
  return (
    <article className="rounded-xl border border-e-line bg-e-card p-4">
      <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-e-dim">
        {mostrarTipo && `${TIPO_LEITURA_LABEL[x.tipo]} · `}
        {x.adri && "Macete da Prof. Adri · "}
        {x.materia} · {x.aula}
      </p>
      <BlocoView b={x.bloco} />
      <Link href={`/admin/estudos/cadernos/${x.materia_id}?aula=${x.aula_id}`} className="mt-2 inline-block text-xs text-e-blue hover:underline">
        Ver na aula →
      </Link>
    </article>
  );
}

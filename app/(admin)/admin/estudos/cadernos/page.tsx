import Link from "next/link";
import { redirect } from "next/navigation";
import { getRespostas } from "@/lib/db-estudos";
import { CADERNOS, getAulasEstudadas } from "@/lib/db-estudos-cadernos";
import { MATERIAS } from "@/lib/estudos-utils";
import { acertoFirme } from "@/lib/estudos-desempenho";
import { Sparkle } from "@/components/estudos/Sparkle";
import { Barra, Cabecalho } from "@/components/estudos/ui";

export default async function CadernosPage() {
  let dados;
  try {
    dados = await Promise.all([getAulasEstudadas(), getRespostas()]);
  } catch {
    redirect("/login");
  }
  const [estudadas, respostas] = dados;
  const ordem = [...MATERIAS].sort((a, b) => (a.fase === 0 ? 0.5 : a.fase) - (b.fase === 0 ? 0.5 : b.fase));
  return (
    <>
      <Cabecalho titulo="Cadernos" sub="Um caderno por matéria: aulas em cadeia (de onde vem, como funciona, exceções, como a FCC cobra), lei seca e o seu caderno de erros." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ordem.map((m) => {
          const c = CADERNOS[m.id];
          const prontas = c ? c.aulas.filter((a) => a.status === "pronta") : [];
          const feitas = prontas.filter((a) => estudadas.has(a.id)).length;
          const erros = new Set(respostas.filter((r) => r.materia_id === m.id && !acertoFirme(r)).map((r) => r.questao_id)).size;
          const conteudo = (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-e-ink">{m.nome}</p>
                {c && <Sparkle size={14} variante="brilhante" />}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Barra pct={prontas.length ? (feitas / prontas.length) * 100 : 0} />
              </div>
              <p className="mt-2 text-[11px] text-e-dim">
                {c ? `${feitas} de ${prontas.length} aulas prontas estudadas · ${c.aulas.length - prontas.length} a montar` : "Caderno ainda não montado"}
                {erros ? ` · ${erros} ${erros === 1 ? "erro" : "erros"}` : ""}
              </p>
            </>
          );
          return c ? (
            <Link key={m.id} href={`/admin/estudos/cadernos/${m.id}`} className="rounded-2xl border border-e-accent/50 bg-e-card p-4 transition-colors duration-150 hover:bg-e-card-2">
              {conteudo}
            </Link>
          ) : (
            <div key={m.id} className="rounded-2xl border border-e-line bg-e-card p-4 opacity-70">{conteudo}</div>
          );
        })}
      </div>
    </>
  );
}

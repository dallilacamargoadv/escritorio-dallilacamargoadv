import { redirect } from "next/navigation";
import { getRegistrosTec } from "@/lib/db-estudos-cadernos";
import { MATERIAS, MATERIA_POR_ID } from "@/lib/estudos-utils";
import { tomPorPct, Barra, Cabecalho, Card, CardTitulo } from "@/components/estudos/ui";
import { TecForm } from "@/components/estudos/TecForm";

export default async function BancaPage() {
  let regs;
  try {
    regs = await getRegistrosTec();
  } catch {
    redirect("/login");
  }
  const materias = [...new Set(regs.map((r) => r.materia_id))];
  return (
    <>
      <Cabecalho
        titulo="Banca FCC"
        sub="Dois tipos de dado, sempre separados: o que a FCC cobra (incidência, contada no TEC) e como você vai (seus resultados). Só entra número com origem."
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          {materias.length === 0 && (
            <Card>
              <p className="text-sm text-e-dim">Ainda sem dados. Lance ao lado os seus resultados do TEC e, quando puder, a incidência por assunto no filtro banca FCC.</p>
            </Card>
          )}
          {materias.map((mid) => {
            const inc = regs.filter((r) => r.materia_id === mid && r.tipo === "incidencia");
            const res = regs.filter((r) => r.materia_id === mid && r.tipo === "resolucao");
            const incAgr = new Map<string, number>();
            const ultimaColeta = inc[0]?.referencia;
            for (const r of inc.filter((x) => x.referencia === ultimaColeta)) incAgr.set(r.assunto, (incAgr.get(r.assunto) ?? 0) + r.questoes);
            const totalInc = [...incAgr.values()].reduce((s, x) => s + x, 0);
            const incOrd = [...incAgr.entries()].sort((a, b) => b[1] - a[1]);
            const resAgr = new Map<string, { q: number; a: number }>();
            for (const r of res) {
              const x = resAgr.get(r.assunto) ?? { q: 0, a: 0 };
              resAgr.set(r.assunto, { q: x.q + r.questoes, a: x.a + (r.acertos ?? 0) });
            }
            const resOrd = [...resAgr.entries()].map(([k, v]) => ({ k, ...v, p: v.q ? Math.round((v.a / v.q) * 100) : 0 })).sort((a, b) => a.p - b.p);
            const totQ = resOrd.reduce((s, x) => s + x.q, 0);
            const totA = resOrd.reduce((s, x) => s + x.a, 0);
            return (
              <Card key={mid}>
                <CardTitulo>{MATERIA_POR_ID.get(mid)?.nome ?? mid}</CardTitulo>
                {incOrd.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-e-dim">O que a FCC cobra mais e menos</p>
                    <p className="text-[11px] text-e-dim">Dado do TEC, filtro banca FCC, coletado em {ultimaColeta?.split("-").reverse().join("/")}. {totalInc} questões no total.</p>
                    <ul className="mt-2 space-y-1.5">
                      {incOrd.map(([assunto, n], i) => (
                        <li key={assunto} className="grid grid-cols-[minmax(110px,1fr)_minmax(0,1.4fr)_70px] items-center gap-3 text-sm">
                          <span className="truncate text-e-ink" title={assunto}>{assunto}</span>
                          <span className="h-3 overflow-hidden rounded-full bg-e-line">
                            <span className="block h-full rounded-full" style={{ width: `${(n / incOrd[0][1]) * 100}%`, background: i < 3 ? "var(--e-accent)" : "var(--e-blue)" }} />
                          </span>
                          <span className="text-right text-xs tabular-nums text-e-dim">{Math.round((n / totalInc) * 1000) / 10}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {resOrd.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-e-dim">Como você vai no TEC</p>
                    <p className="text-[11px] text-e-dim">{totQ} questões resolvidas, {totQ ? Math.round((totA / totQ) * 100) : 0}% de acerto. Do pior para o melhor assunto.</p>
                    <ul className="mt-2 space-y-1.5">
                      {resOrd.map((x) => (
                        <li key={x.k} className="grid grid-cols-[minmax(110px,1fr)_minmax(0,1.4fr)_90px] items-center gap-3 text-sm">
                          <span className="truncate text-e-ink" title={x.k}>{x.k}</span>
                          <Barra pct={x.p} tom={tomPorPct(x.p)} />
                          <span className="text-right text-xs tabular-nums text-e-dim">{x.p}% ({x.a}/{x.q})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <TecForm materias={MATERIAS.map((m) => ({ id: m.id, nome: m.nome }))} />
        </div>
      </div>
    </>
  );
}

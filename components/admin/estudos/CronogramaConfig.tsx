"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MATERIAS, type EstudoConfig } from "@/lib/estudos-utils";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const INPUT = "mt-1 w-full rounded-lg border border-e-line bg-e-card-2 px-2.5 py-1.5 text-sm text-e-ink outline-none focus:border-e-accent";

export function CronogramaConfig({ config, temPlano }: { config: EstudoConfig; temPlano: boolean }) {
  const router = useRouter();
  const [dataProva, setDataProva] = useState(config.dataProva ?? "");
  const [horas, setHoras] = useState(config.minutosPorDia.map((m) => String(Math.round((m / 60) * 10) / 10)));
  const [cond, setCond] = useState<string[]>(config.incluirCondicionais);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function gerar() {
    const minutos = horas.map((h) => Number(h.replace(",", ".")));
    if (minutos.some((h) => !Number.isFinite(h) || h < 0 || h > 10)) {
      setMsg({ tipo: "erro", texto: "Use de 0 a 10 horas em cada dia." });
      return;
    }
    if (minutos.every((h) => h === 0)) {
      setMsg({ tipo: "erro", texto: "Informe ao menos um dia com horas de estudo." });
      return;
    }
    setSalvando(true);
    setMsg(null);
    const cfg: EstudoConfig = {
      ...config,
      dataProva: dataProva || null,
      minutosPorDia: minutos.map((h) => Math.round(h * 60)),
      incluirCondicionais: cond,
    };
    const r1 = await fetch("/api/admin/estudos/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) });
    const r2 = r1.ok ? await fetch("/api/admin/estudos/cronograma", { method: "POST" }) : r1;
    setSalvando(false);
    if (!r2.ok) {
      setMsg({ tipo: "erro", texto: "Não consegui gerar o plano agora. Confira a conexão e tente de novo." });
      return;
    }
    const { total } = await r2.json();
    setMsg({ tipo: "ok", texto: `Plano refeito a partir de hoje com ${total} blocos. O que você já marcou como feito continua no histórico.` });
    router.refresh();
  }

  const condicionais = MATERIAS.filter((m) => m.condicional);
  return (
    <section className="rounded-2xl border border-e-line bg-e-card p-4">
      <h2 className="text-[11px] uppercase tracking-[0.14em] text-e-dim">Seus horários</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-[200px_1fr]">
        <div>
          <label htmlFor="dataProva" className="text-[11px] uppercase tracking-[0.14em] text-e-dim">Data da prova</label>
          <input id="dataProva" type="date" value={dataProva} onChange={(e) => setDataProva(e.target.value)} className={INPUT} />
          <p className="mt-1 text-xs text-e-dim">Sem data, o plano cobre os próximos 200 dias.</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">Horas por dia</p>
          <div className="mt-1 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {DIAS.map((d, i) => (
              <label key={d} className="text-xs text-e-dim">
                {d.slice(0, 3)}
                <input
                  type="text"
                  inputMode="decimal"
                  value={horas[i]}
                  onChange={(e) => setHoras((h) => h.map((x, j) => (j === i ? e.target.value : x)))}
                  className={INPUT}
                  aria-label={`Horas de estudo no ${d}`}
                />
              </label>
            ))}
          </div>
          {(config.excecoes ?? []).length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs text-e-dim">
              {(config.excecoes ?? []).map((e) => (
                <li key={e.de + e.ate}>
                  {e.ate >= "2099-01-01"
                    ? `A partir de ${e.de.split("-").reverse().join("/")}`
                    : e.de === e.ate
                      ? `Em ${e.de.split("-").reverse().join("/")}`
                      : `De ${e.de.split("-").reverse().join("/")} a ${e.ate.split("-").reverse().join("/")}`}
                  : {Math.round((e.minutos / 60) * 10) / 10} h por dia, no lugar da tabela acima.
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <fieldset className="mt-4">
        <legend className="text-[11px] uppercase tracking-[0.14em] text-e-dim">Conhecimentos Gerais que só entram se o edital trouxer</legend>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {condicionais.map((m) => (
            <label key={m.id} className="flex items-center gap-1.5 text-sm text-e-ink">
              <input
                type="checkbox"
                checked={cond.includes(m.id)}
                onChange={(e) => setCond((c) => (e.target.checked ? [...c, m.id] : c.filter((x) => x !== m.id)))}
                className="accent-[var(--e-accent)]"
              />
              {m.nome}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        onClick={gerar}
        disabled={salvando}
        className="mt-4 rounded-full bg-e-glow px-4 py-2 text-sm font-medium text-e-bg disabled:opacity-60"
      >
        {salvando ? "Montando o plano..." : temPlano ? "Salvar e replanejar a partir de hoje" : "Salvar e gerar cronograma"}
      </button>
      {msg && (
        <p role={msg.tipo === "erro" ? "alert" : "status"} className={`mt-2 text-sm ${msg.tipo === "erro" ? "text-e-bad" : "text-e-ok"}`}>
          {msg.texto}
        </p>
      )}
    </section>
  );
}

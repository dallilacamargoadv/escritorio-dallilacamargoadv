import { redirect } from "next/navigation";
import { getEsteiraServicos } from "@/lib/db-esteira-servicos";

export default async function EsteiraServicosPage() {
  let servicos;
  try {
    servicos = await getEsteiraServicos();
  } catch {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <p className="font-eyebrow text-[10px] text-ink-dim">Planejamento</p>
        <h1 className="mt-3 text-lg italic text-ink">Esteira de Serviços</h1>
        <p className="mt-2 text-sm text-ink-dim">
          O catálogo com proposta + contrato + fluxo prontos no CRM, com os valores praticados
          hoje.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {servicos.map((servico) => (
          <div key={servico.id} className="border border-hairline p-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-ink-dim">
                {String(servico.ordem).padStart(2, "0")}
              </span>
              <h2 className="text-base text-ink">{servico.nome}</h2>
            </div>
            {servico.descricao && (
              <p className="mt-2 text-sm text-ink-dim">{servico.descricao}</p>
            )}

            <div className="mt-4 divide-y divide-hairline border-y border-hairline">
              {servico.valores.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-ink-dim">{v.label}</span>
                  <span className="font-mono text-ink">{v.valor}</span>
                </div>
              ))}
            </div>

            {servico.observacao && (
              <p className="mt-3 text-xs text-warning">{servico.observacao}</p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 font-mono text-[10px] text-ink-dim">
        Política geral: parcelamento até 5x no PIX, entrada mínima 30–40%, sem desconto por
        pagamento à vista. Fonte:{" "}
        <code>Estrategia Comercial/HANDOFF-ESTRATEGIA-COMERCIAL.md</code>.
      </p>
    </div>
  );
}

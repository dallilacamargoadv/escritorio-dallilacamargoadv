import type { Caso } from "@/lib/db-casos";
import type { Contrato } from "@/lib/db-contratos";
import type { Cliente } from "@/lib/db-clientes";
import type { Frente } from "@/lib/db-frentes";
import type { Atividade } from "@/lib/db-atividades";
import type { Lancamento } from "@/lib/db-financeiro";
import type { Documento } from "@/lib/db-documentos";
import { isLancamentoAtrasado } from "@/lib/financeiro-utils";
import {
  CASO_STATUS_LABELS,
  CONTRATO_TIPO_LABELS,
  CONTRATO_STATUS_LABELS,
  FORM_TYPE_LABELS,
  FRENTE_STATUS_COLORS,
  FRENTE_STATUS_LABELS,
  FRENTE_TIPO_LABELS,
  ATIVIDADE_STATUS_COLORS,
  ATIVIDADE_STATUS_LABELS,
  ATIVIDADE_TIPO_LABELS,
} from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";
import { Logo } from "@/components/ui/Logo";
import { PrintButton } from "@/components/admin/PrintButton";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Marco {
  label: string;
  data: string;
}

export function CasoRelatorio({
  caso,
  contrato,
  cliente,
  frentes,
  prazos,
  lancamentos,
  documentos,
  variant,
}: {
  caso: Caso;
  contrato: Contrato | null;
  cliente: Cliente | null;
  frentes: Frente[];
  prazos: Atividade[];
  lancamentos: Lancamento[];
  documentos: Documento[];
  variant: "interno" | "cliente";
}) {
  const frentesVisiveis =
    variant === "cliente" ? frentes.filter((f) => f.visivel_cliente) : frentes;
  const prazosVisiveis =
    variant === "cliente" ? prazos.filter((p) => p.visivel_cliente) : prazos;

  const marcos: Marco[] = [
    { label: "Atendimento", data: caso.aberto_em },
    ...(contrato?.status === "assinado" && contrato.assinado_em
      ? [{ label: "Contrato fechado", data: contrato.assinado_em }]
      : []),
    ...lancamentos
      .filter((l) => l.status === "pago" && l.pago_em)
      .map((l) => ({ label: `Pagamento confirmado — ${l.descricao}`, data: l.pago_em! })),
    ...documentos
      .filter((d) => d.marco_cliente)
      .map((d) => ({ label: d.marco_cliente!, data: d.created_at })),
  ].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const totalPago = lancamentos
    .filter((l) => l.status === "pago")
    .reduce((sum, l) => sum + l.valor, 0);
  const totalAberto = lancamentos
    .filter((l) => l.status !== "pago")
    .reduce((sum, l) => sum + l.valor, 0);

  const agora = new Date();
  const geradoEmData = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Belem",
  }).format(agora);
  const geradoEm = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Belem",
  }).format(agora);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <span className="font-eyebrow text-[10px] text-ink-dim">
          {variant === "interno" ? "Relatório interno" : "Relatório do cliente"}
        </span>
        <PrintButton />
      </div>

      <div className="border border-hairline p-10">
        <div className="flex items-start justify-between gap-4 border-b border-hairline-strong pb-5">
          <Logo />
          <p className="text-right font-mono text-[10px] uppercase tracking-wide text-ink-dim">
            {variant === "interno" ? "Relatório interno" : "Relatório de caso"}
            <br />
            {geradoEmData}
          </p>
        </div>

        <h1 className="mt-6 text-lg italic text-ink">{caso.titulo}</h1>
        <p className="mt-1 font-mono text-xs text-ink-dim">
          {FORM_TYPE_LABELS[caso.area] ?? caso.area} · aberto em{" "}
          {formatDate(caso.aberto_em)} · {CASO_STATUS_LABELS[caso.status]}
        </p>

        <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Cliente</p>
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-ink">
          <p>
            <span className="text-ink-dim">Nome: </span>
            {cliente?.nome_razao_social ?? "—"}
          </p>
          {variant === "interno" && (
            <p>
              <span className="text-ink-dim">Documento: </span>
              {cliente?.documento ?? "—"}
            </p>
          )}
          <p>
            <span className="text-ink-dim">E-mail: </span>
            {cliente?.email ?? "—"}
          </p>
          {variant === "interno" && (
            <p>
              <span className="text-ink-dim">WhatsApp: </span>
              {cliente?.whatsapp ?? "—"}
            </p>
          )}
        </div>

        {contrato && (
          <>
            <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Contrato</p>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-ink">
              <p>
                <span className="text-ink-dim">Tipo: </span>
                {CONTRATO_TIPO_LABELS[contrato.tipo]}
              </p>
              <p>
                <span className="text-ink-dim">Status: </span>
                {CONTRATO_STATUS_LABELS[contrato.status]}
              </p>
              <p>
                <span className="text-ink-dim">Valor: </span>
                {contrato.valor != null ? formatBRL(contrato.valor) : "—"}
              </p>
              <p>
                <span className="text-ink-dim">Periodicidade: </span>
                {contrato.periodicidade ?? "—"}
              </p>
            </div>
          </>
        )}

        <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">
          Frentes ({frentesVisiveis.length}
          {variant === "cliente" && frentesVisiveis.length !== frentes.length
            ? ` de ${frentes.length}`
            : ""}
          )
        </p>
        <div className="mt-2 border border-hairline">
          {frentesVisiveis.length === 0 && (
            <p className="px-4 py-4 text-center text-xs text-ink-dim">
              Nenhuma frente.
            </p>
          )}
          {frentesVisiveis.map((frente, index) => (
            <div
              key={frente.id}
              className={`flex items-center justify-between gap-4 px-4 py-2 text-xs ${
                index !== frentesVisiveis.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-ink">
                  {FRENTE_TIPO_LABELS[frente.tipo]}
                  {frente.orgao ? ` — ${frente.orgao}` : ""}
                </p>
                {frente.numero_processo && (
                  <p className="font-mono text-[10px] text-ink-dim">
                    {frente.numero_processo}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide ${FRENTE_STATUS_COLORS[frente.status]}`}
              >
                {FRENTE_STATUS_LABELS[frente.status]}
              </span>
            </div>
          ))}
        </div>

        {variant === "cliente" && (
          <>
            <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">
              Marcos ({marcos.length})
            </p>
            <div className="mt-2 border border-hairline">
              {marcos.length === 0 && (
                <p className="px-4 py-4 text-center text-xs text-ink-dim">
                  Nenhum marco ainda.
                </p>
              )}
              {marcos.map((marco, index) => (
                <div
                  key={`${marco.label}-${marco.data}`}
                  className={`flex items-center justify-between gap-4 px-4 py-2 text-xs ${
                    index !== marcos.length - 1 ? "border-b border-hairline" : ""
                  }`}
                >
                  <p className="text-ink">{marco.label}</p>
                  <span className="shrink-0 font-mono text-[10px] text-ink-dim">
                    {formatDate(marco.data)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {variant === "interno" && (
          <>
            <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">
              Prazos ({prazosVisiveis.length})
            </p>
            <div className="mt-2 border border-hairline">
              {prazosVisiveis.length === 0 && (
                <p className="px-4 py-4 text-center text-xs text-ink-dim">
                  Nenhum prazo.
                </p>
              )}
              {prazosVisiveis.map((prazo, index) => (
                <div
                  key={prazo.id}
                  className={`flex items-center justify-between gap-4 px-4 py-2 text-xs ${
                    index !== prazosVisiveis.length - 1 ? "border-b border-hairline" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-ink">{prazo.titulo}</p>
                    <p className="font-mono text-[10px] text-ink-dim">
                      {ATIVIDADE_TIPO_LABELS[prazo.tipo]} · {formatDate(prazo.data)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide ${ATIVIDADE_STATUS_COLORS[prazo.status]}`}
                  >
                    {ATIVIDADE_STATUS_LABELS[prazo.status]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Financeiro</p>
        <div className="mt-2 border border-hairline">
          {lancamentos.length === 0 && (
            <p className="px-4 py-4 text-center text-xs text-ink-dim">
              Nenhum lançamento.
            </p>
          )}
          {lancamentos.map((l, index) => {
            const atrasado = isLancamentoAtrasado(l);
            return (
              <div
                key={l.id}
                className={`flex items-center justify-between gap-4 px-4 py-2 text-xs ${
                  index !== lancamentos.length - 1 ? "border-b border-hairline" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-ink">{l.descricao}</p>
                  <p className="font-mono text-[10px] text-ink-dim">
                    Vencimento: {formatDate(l.vencimento)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide ${
                      l.status === "pago"
                        ? "text-success border-success"
                        : atrasado
                          ? "text-error border-error"
                          : "text-gold border-gold"
                    }`}
                  >
                    {l.status === "pago" ? "Pago" : atrasado ? "Atrasado" : "Pendente"}
                  </span>
                  <span className="font-mono text-ink">{formatBRL(l.valor)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-end gap-6 border-t border-hairline-strong pt-2 text-xs">
          <p>
            <span className="text-ink-dim">Total pago: </span>
            <span className="font-mono text-ink">{formatBRL(totalPago)}</span>
          </p>
          <p>
            <span className="text-ink-dim">Em aberto: </span>
            <span className="font-mono text-ink">{formatBRL(totalAberto)}</span>
          </p>
        </div>

        <p className="mt-10 font-mono text-[10px] text-ink-dim">
          {variant === "interno"
            ? `Relatório interno — não enviar ao cliente · gerado em ${geradoEm}`
            : `Dallila Camargo Advocacia · OAB/PA Nº 36.762 · gerado em ${geradoEm}`}
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Cliente } from "@/lib/db-clientes";
import type { Contrato } from "@/lib/db-contratos";
import type { Caso } from "@/lib/db-casos";
import {
  CASO_STATUS_LABELS,
  CONTRATO_STATUS_COLORS,
  CONTRATO_STATUS_LABELS,
  CONTRATO_TIPO_LABELS,
  TIPO_PESSOA_LABELS,
} from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";

export function ClienteDetailSections({
  cliente,
  contratos,
  casos,
}: {
  cliente: Cliente;
  contratos: Contrato[];
  casos: Caso[];
}) {
  const contratosAssinados = contratos.filter((c) => c.status === "assinado");
  const novoCasoHref =
    contratosAssinados.length === 1
      ? `/admin/casos/novo?contratoId=${contratosAssinados[0].id}`
      : `/admin/casos/novo?clienteId=${cliente.id}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">{cliente.nome_razao_social}</h1>
          <p className="font-mono text-xs text-ink-dim">
            {TIPO_PESSOA_LABELS[cliente.tipo_pessoa]} · Cliente desde{" "}
            {formatDate(cliente.created_at)}
          </p>
        </div>
        <Link
          href={`/admin/clientes/${cliente.id}/editar`}
          className="border border-hairline-strong px-4 py-2 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
        >
          Editar dados
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 border border-hairline p-5 text-sm sm:grid-cols-2">
        <div>
          <p className="font-eyebrow text-[10px] text-ink-dim">Documento</p>
          <p className="mt-1 text-ink">{cliente.documento || "—"}</p>
        </div>
        <div>
          <p className="font-eyebrow text-[10px] text-ink-dim">E-mail</p>
          <p className="mt-1 text-ink">{cliente.email}</p>
        </div>
        <div>
          <p className="font-eyebrow text-[10px] text-ink-dim">WhatsApp</p>
          <p className="mt-1 text-ink">{cliente.whatsapp || "—"}</p>
        </div>
        <div>
          <p className="font-eyebrow text-[10px] text-ink-dim">Endereço</p>
          <p className="mt-1 text-ink">{cliente.endereco?.completo || "—"}</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <span className="font-eyebrow text-[10px] text-ink-dim">
            Contratos
          </span>
          <Link
            href={`/admin/contratos/novo?clienteId=${cliente.id}`}
            className="text-xs text-gold transition-colors duration-150 hover:underline"
          >
            + Novo contrato
          </Link>
        </div>
        <div className="mt-3 border border-hairline">
          {contratos.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-dim">
              Nenhum contrato ainda.
            </p>
          )}
          {contratos.map((contrato, index) => (
            <Link
              key={contrato.id}
              href={`/admin/contratos/${contrato.id}`}
              className={`flex items-center justify-between px-4 py-3 text-sm text-ink transition-colors duration-150 hover:text-gold ${
                index !== contratos.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <span>{CONTRATO_TIPO_LABELS[contrato.tipo]}</span>
              <span
                className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${CONTRATO_STATUS_COLORS[contrato.status]}`}
              >
                {CONTRATO_STATUS_LABELS[contrato.status]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <span className="font-eyebrow text-[10px] text-ink-dim">Casos</span>
          {contratosAssinados.length > 0 ? (
            <Link
              href={novoCasoHref}
              className="text-xs text-gold transition-colors duration-150 hover:underline"
            >
              + Novo caso
            </Link>
          ) : (
            <span
              className="text-xs text-ink-dim"
              title="Só é possível abrir um caso sob um contrato assinado"
            >
              + Novo caso (requer contrato assinado)
            </span>
          )}
        </div>
        <div className="mt-3 border border-hairline">
          {casos.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-dim">
              Nenhum caso ainda.
            </p>
          )}
          {casos.map((caso, index) => (
            <Link
              key={caso.id}
              href={`/admin/casos/${caso.id}`}
              className={`flex items-center justify-between px-4 py-3 text-sm text-ink transition-colors duration-150 hover:text-gold ${
                index !== casos.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <span>{caso.titulo}</span>
              <span className="font-mono text-[10px] uppercase text-ink-dim">
                {CASO_STATUS_LABELS[caso.status]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

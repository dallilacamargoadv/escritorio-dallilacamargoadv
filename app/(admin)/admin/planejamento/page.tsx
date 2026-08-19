import { redirect } from "next/navigation";
import { getMetaTrimestreAtual } from "@/lib/db-planejamento";
import { PlanejamentoClient } from "@/components/admin/PlanejamentoClient";

export default async function PlanejamentoPage() {
  let meta;
  try {
    meta = await getMetaTrimestreAtual();
  } catch {
    redirect("/login");
  }

  if (!meta) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-sm text-ink-dim">
          Nenhum objetivo de trimestre cadastrado ainda.
        </p>
      </div>
    );
  }

  return <PlanejamentoClient meta={meta} />;
}
